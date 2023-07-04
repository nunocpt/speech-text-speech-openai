import { useState, useEffect } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import axios from "axios";
import Speech from "speak-tts";

const App = () => {
  const speech = new Speech();
  speech.init({
    volume: 1,
    lang: "en-GB",
    rate: 1,
    pitch: 1,
    voice: "Google UK English Male",
    splitSentences: true,
    listeners: {
      onvoiceschanged: (voices) => {
        console.log("Event voiceschanged", voices);
      },
    },
  });
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  /* const leonardoAiOptions = {
    method: "POST",
    url: "https://cloud.leonardo.ai/api/rest/v1/generations",
    headers: { accept: "application/json", "content-type": "application/json" },
    data: {
      prompt: "An oil painting of a cat",
      modelId: "6bef9f1b-29cb-40c7-b9df-32b51c1f67d3",
      width: 512,
      height: 512,
    },
  };

  const submitLeonardoAi = () => {
    axios
      .request(leonardoAiOptions)
      .then(function (response) {
        console.log(response.data);
      })
      .catch(function (error) {
        console.error(error);
      });
  }; */

  const { transcript, listening, browserSupportsSpeechRecognition } =
    useSpeechRecognition();

  useEffect(() => {
    let timeoutId;

    const handleChange = () => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        transcript.length && handleSubmit(transcript);
      }, 1000);
    };

    handleChange(); // Initial call to setup the timeout

    return () => {
      clearTimeout(timeoutId); // Cleanup the timeout on component unmount
    };
  }, [transcript]);

  const handleSubmit = async (transcript) => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
    };
    const data = {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: transcript }],
      temperature: 0.7,
    };

    axios
      .post("https://api.openai.com/v1/chat/completions", data, { headers })
      .then((response) => {
        console.log(response.data);
        setResult(response.data.choices[0].message.content);
        speech
          .speak({
            text: response.data.choices[0].message.content,
          })
          .then(() => {
            console.log("Success !");
          })
          .catch((e) => {
            console.error("An error occurred :", e);
          });
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  const handleStartListening = () => {
    setLoading(true);
    SpeechRecognition.startListening();
  };

  return (
    <main className="main">
      <div className="w-2/4 mx-auto">
        <button
          onClick={handleStartListening}
          className="btn"
          disabled={loading}
        >
          {listening ? "Listening..." : loading ? "Generating..." : "Start"}
        </button>
        <p>{transcript}</p>

        <pre className="result">{result}</pre>
      </div>

      {/* <button onClick={submitLeonardoAi}>LeonardoAi</button> */}
    </main>
  );
};

export default App;
