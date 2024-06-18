import React from 'react';
import './Loader.css';

export default function Loader() {
  return (
    <div className="loader">
      <div className="square" ></div>
      <div className="square"></div>
      <div className="square last"></div>
      <div className="square clear"></div>
      <div className="square"></div>
      <div className="square last"></div>
      <div className="square clear"></div>
      <div className="square "></div>
      <div className="square last"></div>
    </div>
  );
}
