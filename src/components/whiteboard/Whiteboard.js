import { useEffect, useLayoutEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { useDispatch } from 'react-redux';
import { Tldraw, createTLStore, defaultShapeUtils, throttle } from 'tldraw';
import { getDrawing, saveDrawing as saveDrawingAPI } from '../../reducers/project/projectSlice';
import { DRAWING } from '../../utils/socket-events';
import { useParams } from 'react-router-dom';
import socket from '../../utils/socket';
import CachedIcon from '@mui/icons-material/Cached';
import 'tldraw/tldraw.css';

export default function Whiteboard() {

  const dispatch = useDispatch();
  const projectId = useParams().id;

  const [store] = useState(() => createTLStore({ shapeUtils: defaultShapeUtils }));
 
  const [loadingState, setLoadingState] = useState({
    status: 'loading',
  });
  const [isNewChanges, setIsNewChanges] = useState(false);
  const [drawing, setDrawing] = useState('');

  useEffect(() => {
    socket.on(DRAWING, (data) => {
      if(data.projectId === projectId){
        setIsNewChanges(true);
        setDrawing(data.data);
      }
    });

    return () => {
      socket.off(DRAWING);
    };
  },[socket]);

  const reloadDrawing = () => {
    loadDrawing(drawing);
    setIsNewChanges(false);
  };
  
  const loadDrawing = async (drawing = null) => {
    setLoadingState({ status: 'loading' });
    try {
      const response = await dispatch(getDrawing(projectId));
      if (response) {
        store.loadSnapshot(JSON.parse(drawing || response.data));
        setLoadingState({ status: 'ready' });
      } else {
        setLoadingState({ status: 'ready' });
      }
    } catch (error) {
      setLoadingState({ status: 'error', error: error.message });
    }
  };

  const saveDrawing = throttle(async () => {
    try {
      const snapshot = store.getSnapshot();

      socket.emit(DRAWING, {
        projectId,
        data: JSON.stringify(snapshot)
      });

      if (projectId) {
        await dispatch(saveDrawingAPI({ projectId, data: JSON.stringify(snapshot) }));
      }
    } catch (err) {
      console.error(err);
    }
  }, 500);

  useLayoutEffect(() => {
    const loadData = async () => {
      await loadDrawing();

      const cleanupFn = store.listen(saveDrawing);

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
    <>
      <Box 
        visibility={isNewChanges ? 'visible' : 'hidden'} 
        position={'absolute'} 
        zIndex={2}
        top={50}
        right={15}
      >
        <Button 
          size="small"
          variant='text'
          sx={{ color:'black' }}
          onClick={reloadDrawing}
          endIcon={<CachedIcon />}
        >
          NEW CHANGES
        </Button>
      </Box>

      <Box position={'relative'} mt={0.5} zIndex={1}>
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
    </>
  );
}
