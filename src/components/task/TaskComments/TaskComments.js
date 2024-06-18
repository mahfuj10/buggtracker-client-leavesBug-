import { Box } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import TaskCommentFooter from './TaskCommentFooter';
import Comment from './Comment';
import Loader from '../../common/Loader/Loader';
import { useDispatch } from 'react-redux';
import { useSelector } from 'react-redux';
import { selectTask } from '../../../reducers/project/projectSlice';
import { getComment, deleteComment as deleteCommentAPI } from '../../../reducers/comment/commentSlice';
import socket from '../../../utils/socket';
import { DELETE_COMMENT, NEW_COMMENT } from '../../../utils/socket-events';

export default function TaskComments() {

  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const task = useSelector(selectTask);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchComments = async() => {
      try{
        setIsLoading(true);

        const response = await dispatch(getComment(task._id));

        if(response){
          setComments(response);
        }
      }catch(err){
        console.error(err);
      }
      setIsLoading(false);
    };

    fetchComments();
  }, [dispatch]);

  useEffect(() => {
    socket.on(NEW_COMMENT, ({ comment, taskId }) => {
      if(task._id === taskId){
        addComment(comment);
      }
    });

    socket.on(DELETE_COMMENT, (commentId) => {
      const remining_comments = comments.filter(comment => comment._id !== commentId);
      setComments(remining_comments);
    });

    return () => {
      socket.off(NEW_COMMENT);
      socket.off(DELETE_COMMENT);
    };
  },[socket, comments]);

  const addComment = newComment => {
    setComments(prev => [...prev, newComment]);
    setTimeout(() => scrollToBottom(), 100);
  };

  const deleteComment = commentId => {
    const remining_comments = comments.filter(comment => comment._id !== commentId);
    setComments(remining_comments);
    dispatch(deleteCommentAPI(commentId));
    socket.emit(DELETE_COMMENT, commentId);
  };

  const scrollToBottom = () => {
    containerRef.current.style.scrollBehavior = 'smooth';
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  };

  if(isLoading) return <Loader />;

  return (
    <>

      <Box ref={containerRef} sx={{ height: window.innerHeight - 75 }} mx={2} overflow={'scroll'}>
        {
          comments.map(comment => <Comment
            key={comment._id}
            comment={comment} 
            deleteComment={deleteComment}
          />)
        }
      </Box>

      <TaskCommentFooter
        addComment={addComment}
      />
    </>
  );
}
