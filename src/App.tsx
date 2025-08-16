import React, { useState, useEffect } from 'react';
import Tabs from './Tabs'
import './App.css';
import VoiceAssistant from './containers/VoiceAssistant/VoiceAssistant';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    chrome.runtime.sendMessage({ type: 'getMessage' }, (response: { message: React.SetStateAction<string>; }) => {
      setMessage(response.message);
    });
  }, []);

  useEffect(() => {
    console.log(message);
  }, [message]);

  return (
    <ThemeProvider theme={darkTheme}>
    <div className="App">
      <section className="App-content">
        <Tabs
          tabs={[
            { value: '1', caption: 'Kata', component: <VoiceAssistant/> },
            { value: '2', caption: 'Plugins', component: <VoiceAssistant/>  },
            { value: '3', caption: 'About', component: <VoiceAssistant/>  },
          ]}
        />
      </section>
    </div>
    </ThemeProvider>
  );
}

export default App;
