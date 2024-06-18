import React from 'react';

const ShareButton = ({ url, socialMedia }) => {
  
  const handleClick = () => {
    let shareUrl = '';
    switch (socialMedia) {
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      break;
    default:
      return;
    }
    window.open(shareUrl, '_blank');
  };

  return (
    <button onClick={handleClick}>
            Share on {socialMedia.charAt(0).toUpperCase() + socialMedia.slice(1)}
    </button>
  );
};

export default ShareButton;
