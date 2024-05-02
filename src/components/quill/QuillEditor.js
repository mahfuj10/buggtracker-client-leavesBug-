import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export default function QuillEditor({ value, func}) {

  const modules = {
    toolbar: [
      [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
      [{size: []}],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, 
        {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };
  
  return (
    <ReactQuill
      theme="snow" // Specify the theme (optional)
      value={value} // Set the editor content
      onChange={e => func(e)} // Handle changes
      modules={modules} // Pass the modules prop to enable custom toolbar
      style={{ height: '100%' }} // Set the height using inline CSS
    />
  );
}
