import React from 'react';
import { useUtils } from '../../../utils/useUtils';
import { Box, IconButton, Typography } from '@mui/material';
import { Description, DownloadForOfflineOutlined } from '@mui/icons-material';

export default function MessageMedia({ media }) {
  const { getFileTypeFromUrl, getFileName } = useUtils();

  const openPDF = url => {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.click();
  };
    
  return (
    <Box display="flex" flexWrap={'wrap'} gap={1}>
      {
        media.map((fileUrl, index) => {
          const fileType = getFileTypeFromUrl(fileUrl);

          if (fileType.startsWith('image/')) {
            return (
              <img 
                key={index} 
                src={fileUrl} 
                alt="file"
                style={{ maxWidth: '100%', borderRadius: '10px'}} 
              />
            );
          } else if (fileType.startsWith('video/')) {
            return (
              <video 
                key={index}
                controls 
                src={fileUrl}
                style={{ maxWidth: '100%', borderRadius: '10px'}} 
              />
            );
          } else if (fileType.startsWith('audio/')) {
            return (
              <audio 
                key={index}
                style={{ maxWidth: '100%' }} 
                controls 
                src={fileUrl} 
              />
            );
          } else if (fileType === 'application/pdf') {
            return (
              <Box
                key={index}
                display={'flex'}
                bgcolor={'rgba(0, 0, 0, 0.2)'}
                width={'auto'}
                borderRadius={2}
                p={1}
                className='cursor-pointer'
                onClick={() => openPDF(fileUrl)}
              >
                <IconButton size='small'>
                  <Description sx={{ color: 'whitesmoke' }} />
                </IconButton>
                <Box>
                  <Typography title={getFileName(fileUrl)} className='text-break' fontSize={12}>
                    {getFileName(fileUrl)}
                  </Typography>
                  <Typography title={getFileName(fileUrl)} className='text-break' fontSize={10}>
                    {fileType}
                  </Typography>
                </Box>
              </Box>
            );
          } else {
            return (
              <Box
                key={index}
                display={'flex'}
                bgcolor={'rgba(0, 0, 0, 0.2)'}
                width={'auto'}
                borderRadius={2}
                p={1}
                className='cursor-pointer'
                onClick={() => openPDF(fileUrl)}
              >
                <IconButton size='small'>
                  <DownloadForOfflineOutlined />
                </IconButton>
                <Box>
                  <Typography title={getFileName(fileUrl)} className='text-break' fontSize={12}>
                    {getFileName(fileUrl)}
                  </Typography>
                  <Typography title={getFileName(fileUrl)} className='text-break' fontSize={10}>
                    {fileType}
                  </Typography>
                </Box>
              </Box>
            );
          }
        })
      }
    </Box>
  );
}
