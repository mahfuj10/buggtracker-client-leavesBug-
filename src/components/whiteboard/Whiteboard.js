import { Box } from '@mui/material';
import { useEffect, useLayoutEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Tldraw, createTLStore, defaultShapeUtils, throttle } from 'tldraw';
import 'tldraw/tldraw.css';
import { getDrawing, saveDrawing } from '../../reducers/project/projectSlice';
import { useParams } from 'react-router-dom';
import socket from '../../utils/socket';
import { DRAWING } from '../../utils/socket-events';

export default function Whiteboard() {

  const dispatch = useDispatch();
  const projectId = useParams().id;

  const [store] = useState(() => createTLStore({ shapeUtils: defaultShapeUtils }));
 
  const [loadingState, setLoadingState] = useState({
    status: 'loading',
  });

  useEffect(() => {
    socket.on(DRAWING, data => {
      console.log(data);
      // store.loadSnapshot(JSON.parse(data));
    });

    return () => {
      socket.off(DRAWING);
    };
  },[socket]);
  
  useLayoutEffect(() => {
    const loadData = async () => {
      setLoadingState({ status: 'loading' });

      try {
        const response = await dispatch(getDrawing(projectId));

        if(response){
          store.loadSnapshot(JSON.parse(response.data));
          setLoadingState({ status: 'ready' });
        }else {
          setLoadingState({ status: 'ready' });
        }
      } catch (error) {
        setLoadingState({ status: 'error', error: error.message });
      }
      

      const cleanupFn = store.listen(
        throttle(async() => {
          try{
            const snapshot = store.getSnapshot();

            socket.emit(DRAWING, JSON.stringify(snapshot));

            if(projectId){
              await dispatch(saveDrawing({ projectId, data: JSON.stringify(snapshot) }));
            }
          }catch(err){
            console.error(err);
          }
        }, 500)
      );

      return cleanupFn;
    };

    const cleanupFnPromise = loadData();

    return () => {
      cleanupFnPromise.then(cleanupFn => {
        if (cleanupFn) {
          cleanupFn();
        }
      });
    };
  }, [store]);


  if (loadingState.status === 'loading') {
    return (
      <div className="tldraw__editor">
        <h2>Loading...</h2>
      </div>
    );
  }

  if (loadingState.status === 'error') {
    return (
      <div className="tldraw__editor">
        <h2>Error!</h2>
        <p>{loadingState.error}</p>
      </div>
    );
  }

  return (
    <Box position={'relative'} mt={0.5}>
      <Box
        sx={{ inset: 0 }} 
        position={'absolute'}  
        width={'100%'} 
        height={window.innerHeight - 135} 
        top={100}
      >
        <Tldraw store={store}  />
      </Box>
    </Box>
  );
}
