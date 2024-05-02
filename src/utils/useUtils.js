export const useUtils = () => {
  const extractUser = (user) => {
    return {
      name: user.displayName,
      accessToken: user.accessToken,
      email: user.email,
      uid: user.uid,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified
    };
  };
  
  function isEmailValid(email) {
    // Regular expression for validating email
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  }
  
  function isValidProjectName(name) {
    const emailRegex = /^[a-zA-Z0-9_-]+$/;
    return emailRegex.test(name);
  }

  function generateOTP() {
    const otp = Math.floor(10000 + Math.random() * 90000);
    return otp;
  }

  function createImageWithInitial(name, size = 100, bgColor = '#f2f2f2', textColor = '#333', fontSize = size / 2) {
    // Create a canvas element
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);

    // Draw text (first letter of the name)
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = textColor;
    ctx.fillText(name.charAt(0).toUpperCase(), size / 2, size / 2);

    const dataURL = canvas.toDataURL();
    
    return dataURL;
  }

  const getCurrentLocation = async () => {
    try {
      if (navigator.geolocation) {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
       
        return {
          lat: position.coords.latitude,
          long: position.coords.longitude
        };
      } else {
        console.log('Geolocation is not supported by this browser.');
        return {
          lat: 0,
          long: 0
        };
      }
    } catch (error) {
      console.log(error);
      return {
        lat: 0,
        long: 0
      };
    }
  };

  function addSpecialCharacters(email) {
    const specialCharacter = '(~)|*!$';
    let modifiedEmail = '';
    for (let i = 0; i < email.length; i++) {
      modifiedEmail += email[i] + specialCharacter[i % specialCharacter.length];
    }
    return modifiedEmail;
  }
  
  function removeSpecialCharacters(email) {
    const specialCharacters = '(~)|*!$'; 
    let cleanEmail = '';
    for (let i = 0; i < email.length; i++) {
      if (!specialCharacters.includes(email[i])) {
        cleanEmail += email[i];
      }
    }
    return cleanEmail;
  }

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }
  
  function getRandomColor() {

    const randomHexColor = () => {
      return Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    };
  
    const backgroundR = randomHexColor();
    const backgroundG = randomHexColor();
    const backgroundB = randomHexColor();
  
    const backgroundColor = `#${backgroundR}${backgroundG}${backgroundB}`;
  
    const brightness = ((parseInt(backgroundR, 16) * 299) +
                       (parseInt(backgroundG, 16) * 587) +
                       (parseInt(backgroundB, 16) * 114)) / 1000;
  
    const textColor = brightness > 125 ? '#000000' : '#ffffff';
  
    return { backgroundColor, textColor };
  }

  function calculateDaysRemaining(startDate, endDate) {
    const startTimestamp = new Date(startDate).getTime();
    const endTimestamp = new Date(endDate).getTime();

    const difference = endTimestamp - startTimestamp;
  
    return Math.ceil(difference / (1000 * 60 * 60 * 24));
  }
  
  const getCreatedDate  = (createdAt) => {
    return new Date(createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric'
    });
  };
  

  return {
    extractUser,
    generateOTP,
    isEmailValid,
    isValidProjectName,
    createImageWithInitial,
    getCurrentLocation,
    addSpecialCharacters,
    removeSpecialCharacters,
    formatDate,
    getRandomColor,
    calculateDaysRemaining,
    getCreatedDate
  };
};
  