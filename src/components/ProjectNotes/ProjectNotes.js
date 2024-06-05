import React, { useEffect, useState } from 'react';
import QuillEditor from '../quill/QuillEditor';
import { Box, Button, IconButton, InputBase, Tooltip, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { createNote, deleteNote, getNotes, updateNote } from '../../reducers/project/projectSlice';
import { useParams } from 'react-router-dom';
import { DeleteOutline, Download, Polyline } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { selectUser } from '../../reducers/auth/authSlice';
import socket from '../../utils/socket';
import { NOTE_CREATED, NOTE_UPDATED } from '../../utils/socket-events';
import { useUtils } from '../../utils/useUtils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import moment from 'moment';
import Loader from '../common/Loader/Loader';

export default function ProjectNotes() {

  // title is not updating real time [todo]

  const [notes, setNotes] = useState([]);
  const [selectedNote, setSelectedNote] = useState({});
  const [isLoading, setIsLoading] = useState(false);


  const dispatch = useDispatch();
  const projectId = useParams().id;

  const currentLoginUser = useSelector(selectUser);
  const { debounce } = useUtils();

  useEffect(() => {
    const fetchNotes = async(projectId) => {
      try{
        setIsLoading(true);

        const response = await dispatch(getNotes(projectId));

        if(response.length > 0){
          setNotes(response);
          setSelectedNote(response[0]);
        }
      }catch(err){
        console.error(err);
      }
      setIsLoading(false);
    };

    fetchNotes(projectId);
  }, []);

  useEffect(() => {
    socket.on(NOTE_CREATED, (newNote) => {
      if(projectId === newNote.projectId){
        setNotes(prev => [...prev, newNote]);
        if(notes.length === 1) setSelectedNote(newNote);
      }
    });
    
    socket.on(NOTE_UPDATED, (note) => {
      if(selectedNote._id === note._id && note.updatorId !== currentLoginUser._id){
        updateNoteInState(note._id, { content: note.content, title: note.title });
        setSelectedNote(note);
      }
    });

    return () => {
      socket.off(NOTE_CREATED);
      socket.off(NOTE_UPDATED);
    };
  },[socket, selectedNote]);

  const handleCreateNote = async() => {
    try {
      setIsLoading(true);
        
      const newNote = {
        title: `#Note ${notes.length + 1}`,
        projectId: projectId,
        creator: currentLoginUser._id
      };
      
      const response = await dispatch(createNote(newNote));
      
      if(response){
        setNotes(prev => [...prev, {...response, creator: currentLoginUser}]);
        socket.emit(NOTE_CREATED, {...response, creator: currentLoginUser});
      }
    }catch(err){
      console.error(err);
    }
    setIsLoading(false);
  };

  const handleDeleteNote = async(noteId) => {
    try {
      setIsLoading(true);
        
      const response =  await dispatch(deleteNote(noteId));
      
      if(response){
        const remining_notes = notes.filter(note => note._id !== noteId);
        setSelectedNote(remining_notes.length > 0 ? remining_notes[0] : {});
        setNotes(remining_notes);
      }
    }catch(err){
      console.error(err);
    }
    setIsLoading(false);
  };

  const updateNoteContent = (content) => {

    updateNoteInState(selectedNote._id, { content });
    setSelectedNote({...selectedNote, content });

    const handleTypingFinished = debounce(async() => {
      try{
        setIsLoading(true);
          
        socket.emit(NOTE_UPDATED, {
          updatorId: currentLoginUser._id,
          ...selectedNote
        });

        await dispatch(updateNote(selectedNote._id, { content, updator: currentLoginUser._id }));

      }catch(err){
        console.error(err);
      }
      setIsLoading(false);
    }, 1000);
  
    handleTypingFinished();
  };

  const updateNoteTitle = (noteId, title) => {
    
    updateNoteInState(noteId, { title });

    const handleTypingFinished = debounce(async() => {
      try{
        setIsLoading(true);

        socket.emit(NOTE_UPDATED, {
          updatorId: currentLoginUser._id,
          ...selectedNote
        });
          
        await dispatch(updateNote(noteId, { title, updator: currentLoginUser._id }));
      }catch(err){
        console.error(err);
      }
      setIsLoading(false);
    }, 1000);
  
    handleTypingFinished();
  };

  const updateNoteInState = (noteId, doc) => {
    const updatedNotes = notes.map(note =>
      note._id === noteId ? { ...note, ...doc } : note
    );

    setNotes(updatedNotes);
  };

  const downloadPDF = async() => {
    const content = document.createElement('div');
    content.innerHTML = selectedNote.content;
    document.body.appendChild(content);
  
    const canvas = await html2canvas(content);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'pt', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
  
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`${selectedNote.title}.pdf`);
  
    document.body.removeChild(content);
  
  };

  if(isLoading) <Loader />;

  return (
    <>

      {
        (!notes.length && !isLoading) && <Box 
          display={'flex'}
          justifyContent={'center'}
          m={5}
        >
          <Button onClick={handleCreateNote} variant='' disabled={isLoading}>
            <Polyline /> Create Note
          </Button>
        </Box>
      }

      {
        notes.length > 0 &&
      <Box
        display={'flex'}
        alignItems={'start'}
        m={2}
      >
      
        <Box borderRight={'1px solid #e0e0e0'} height={window.innerHeight - 200}>
          {
            notes.map(note => <Box 
              key={note._id}
              minWidth={250}
              mt={1}
              display={'flex'}
              pr={1}
              sx={{
                ':hover .delete-icon': {
                  visibility:'visible'
                }
              }}
              onClick={() => setSelectedNote(note)}
            >
              <InputBase 
                fullWidth
                size='small'
                value={note.title} 
                sx={{ fontWeight: selectedNote._id === note._id ? 'bold' : 'medium' }}
                onChange={e => updateNoteTitle(note._id, e.target.value)}
              />
          
              <IconButton 
                size='small'
                sx={{
                  visibility: 'hidden',
                  transition: '0.2s'
                }}
                onClick={() => handleDeleteNote(note._id)}
                disabled={isLoading}
                className='delete-icon'
              >
                <DeleteOutline />
              </IconButton>
            </Box>
            )
          }

          <Box
            display={'flex'}
            justifyContent={'center'}
            mt={1}
            disabled={isLoading}
          >
            <Button
              size='small'
              variant='text'
              sx={{ color: 'black' }}
              onClick={handleCreateNote}
            >  
             create new note
            </Button>
          </Box>
        </Box>

        <Box 
          className='quill-no-border'
          width={'100%'} 
          maxHeight={window.innerHeight - 200} 
          overflow={'auto'}
        >
          <Box
            display={'flex'} 
            alignItems={'center'}
          >
            {
              selectedNote.creator?.email && <Tooltip arrow title={selectedNote.creator.email}>
                <Typography
                  variant='caption' 
                  color={'grey'}
                  ml={1}
                >
                Created by {selectedNote.creator.name}, {moment(selectedNote.createdAt).fromNow()}.
                </Typography>
              </Tooltip>
            }
            {
              selectedNote.updator?.email &&
              <Tooltip arrow title={selectedNote.updator.email}>
                <Typography
                  variant='caption' 
                  color={'grey'}
                  ml={1}
                >
                 Last updated by {selectedNote.updator.name}, {moment(selectedNote.updatedAt).fromNow()}.
                </Typography>
              </Tooltip>
            }

            <IconButton 
              size='small'
              onClick={downloadPDF}
            >
              <Download />
            </IconButton>
          </Box>


          <QuillEditor 
            onChange={updateNoteContent} 
            value={selectedNote.content}
          />
          
        </Box>

      </Box>
      }

    </>
  );
}
