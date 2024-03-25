import React, { useEffect, useState,useContext } from 'react';
import UserContext from './user-context';

const DogPicture = () => {
  const [imageUrl, setImageUrl] = useState('');
  const user = useContext(UserContext);
  useEffect(() => {
    console.log(user.name);
    fetch('https://dog.ceo/api/breeds/image/random')
      .then((res) => res.json())
      .then((data) => {
        setImageUrl(data.message);
      });
  }, []);

  return (
    <div>
      <img src={imageUrl} alt='a dog' />
      <h1>{user.name}</h1>
    </div>
  );
};

export default DogPicture;