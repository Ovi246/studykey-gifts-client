import { useEffect, useState } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import Fireworks from "@fireworks-js/react";
import Popup from "reactjs-popup";
import i18n from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";
import IntroPhoto from "./assets/intro page.png";
import Photo1 from "./assets/(1).png";
import Photo2 from "./assets/(2).png";
import Photo3 from "./assets/(3).png";
import Photo4 from "./assets/(4).png";
import Photo5 from "./assets/(5).png";
import Photo6 from "./assets/(6).png";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        solveRiddlePrompt: "Can you solve the riddle?",
        riddle: `"I'm a pack of fun, now wrapping, just cards in a stack, Each one's a
        gem, knowledge that won't lack. Flip me around, see what's in store,
        A gift for your brain, a learning encore, Give it a whirl, I'm the
        flashiest thing in your study world! What am I?"`,
        buttonPlaceholder: "Enter your answer",
        buttonText: "Submit",
      },
    },
    es: {
      translation: {
        solveRiddlePrompt: "¿Puedes resolver el acertijo?",
        riddle: `"Soy un paquete de diversión, ahora envuelto, solo cartas en una pila, Cada una es una joya, conocimiento que no faltará. Dame la vuelta, mira lo que hay en la tienda,
        Un regalo para tu cerebro, un bis de aprendizaje. Dale una vuelta, soy el
        ¡Lo más llamativo de tu mundo de estudio! ¿Qué soy yo?"`,
        buttonPlaceholder: "Introduce tu respuesta",
        buttonText: "Entregar",
      },
    },
    // Add more languages here
  },
  lng: "en", // Default language
  fallbackLng: "en", // Use English if the language can't be detected
  interpolation: { escapeValue: false },
});

// Your form component
function Form() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [asin, setAsin] = useState();
  const [formData, setFormData] = useState({
    orderId: "",
    name: "",
    email: "",
    address: "",
    set: "",
  });
  const [isCorrect, setIsCorrect] = useState(false);
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const { t } = useTranslation();
  const [language, setLanguage] = useState("en");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    async function fetchLocationAndSetLanguage() {
      try {
        const response = await axios.get(
          "https://studykey-gifts-server.vercel.app/api/location"
        );
        const geo = response.data;
        const language = getLanguageFromCountryCode(geo.country); // Implement this function
        setLanguage(language);
        i18n.changeLanguage(language);
      } catch (error) {
        console.error("Failed to fetch location or set language:", error);
      }
    }
    fetchLocationAndSetLanguage();
  }, []);

  function getLanguageFromCountryCode(countryCode) {
    // Map country codes to languages
    const countryToLanguage = {
      US: "en",
      ES: "es",
      // Add more countries here
    };
    return countryToLanguage[countryCode] || "en"; // Default to English
  }

  const changeLanguage = (event) => {
    i18n.changeLanguage(event.target.value);
    setLanguage(event.target.value);
  };

  const checkAnswer = () => {
    if (answer.toLowerCase() === "flashcards") {
      setIsCorrect(true);
      setShowFireworks(true);
      setTimeout(() => {
        setShowFireworks(false);
      }, 5000); // Fireworks will disappear after 5 seconds
      setShowReward(true);
    } else if (attempts > 1) {
      setAttempts(attempts - 1);
    } else {
      alert("The correct answer is: flashcards");
      setAttempts(0);
    }
  };

  const claimReward = () => {
    setShowFeedbackForm(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.name.trim()) {
        newErrors.name = "Name is required";
      }

      if (!formData.set) {
        newErrors.set = "Please select a Study Key set";
      }
      if (!formData.orderId) {
        newErrors.orderId = "Order ID is required";
      }
    }

    if (step === 2) {
      if (!formData.email) {
        newErrors.email = "Email is required";
      }
      if (!formData.address) {
        newErrors.address = "Address is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = async (event) => {
    event.preventDefault();

    if (step > 1) {
      if (!validateForm()) {
        toast.error("Please fill in all required fields");
        return;
      }
    }

    setLoading(true);
    if (step === 1) {
      if (!validateForm()) {
        toast.error("Please fill in all required fields");
        setLoading(false);
        return;
      }
      try {
        const response = await axios.post(
          "https://studykey-gifts-server.vercel.app/validate-order-id",
          { orderId: formData.orderId },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        setAsin(response.data.asins[0]);
      } catch (error) {
        console.log(error?.response.status);
        if (error?.response.status === 400) {
          toast.error(
            "Order ID does not match. Please make sure to put the correct Amazon order number."
          );
        } else {
          toast.error("Internal server error! Please try again later!");
        }
        setLoading(false);
        return;
      }
    }

    setTimeout(() => {
      setStep(step + 1);
      setCompletedSteps([...completedSteps, step]);
      setLoading(false);
    }, 1000); // simulate loading time
  };

  const handleInputChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
    setErrors({
      ...errors,
      [event.target.name]: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (step === 2) {
      if (!validateForm()) {
        toast.error("Please fill in all required fields");
        return;
      }
    }
    setLoading(true);
    try {
      const response = await axios.post(
        "https://studykey-gifts-server.vercel.app/submit-review",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.status === 200) {
        toast.success("Form submitted successfully!");
        setTimeout(() => {
          setStep(step + 1);
          setCompletedSteps([...completedSteps, step]);
          setLoading(false);
        }, 1000); // simulate loading time
      }
    } catch (error) {
      console.log(error);
      if (error.response.data.errorCode === "DUPLICATE_EMAIL") {
        toast.error("This email is already claimed a gift!");
      }
    }
  };

  const handleStepClick = (stepNumber) => {
    if (completedSteps.includes(stepNumber)) {
      setStep(stepNumber);
    }
  };

  function StarIcon(props) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    );
  }

  console.log(step);

  if (showFeedbackForm) {
    if (step === 1) {
      return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4 ">
          <div className="max-w-4xl w-full">
            <h1 className="text-3xl font-bold text-center mb-8">
              Here is your first step to receiving your gift!
            </h1>
            <div className="relative">
              <div className="absolute -left-10 top-0 -translate-x-1/2 z-50 ">
                <img
                  src={Photo2}
                  width={250}
                  height={300}
                  alt="Don't put off until tomorrow what you can do today."
                  className="rounded-lg shadow-md"
                />
              </div>
              <div className="absolute -left-20 top-40 -translate-x-1/3 -rotate-12 z-40">
                <img
                  src={Photo1}
                  width={250}
                  height={300}
                  alt="No dejes para mañana lo que puedes hacer hoy."
                  className="rounded-lg shadow-md"
                />
              </div>
              <form className="space-y-6 ml-32">
                <div>
                  <label htmlFor="name" className="block text-lg mb-2">
                    What should I call you, my fellow language lover?
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full p-3 bg-red-500 text-white placeholder-white::placeholder rounded ${
                      errors.name ? "border-2 border-yellow-400" : ""
                    }`}
                    placeholder="Name"
                    required
                  />
                  {errors.name && (
                    <p className="text-yellow-400 mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="set" className="block text-lg mb-2">
                    Which Study Key set did you choose to add to your learning?
                  </label>
                  <select
                    id="set"
                    name="set"
                    value={formData.set}
                    onChange={handleInputChange}
                    className={`w-full p-3 bg-red-500 text-white placeholder-white::placeholder rounded ${
                      errors.set ? "border-2 border-yellow-400" : ""
                    }`}
                    required
                  >
                    <option value="">Select Product Set</option>
                    <option value="multi">Multi Set Spanish Flashcards</option>
                    <option value="nouns">
                      Nouns English to Spanish Flashcards
                    </option>
                    <option value="toddlers">
                      Toddlers English learn & Play
                    </option>
                  </select>
                  {errors.set && (
                    <p className="text-yellow-400 mt-1">{errors.set}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="orderId" className="block text-lg mb-2">
                    Please let me know your order number here. You can find it
                    in your Amazon account under "Orders."
                  </label>
                  <input
                    type="text"
                    id="orderId"
                    name="orderId"
                    value={formData.orderId}
                    onChange={handleInputChange}
                    className={`w-full p-3 bg-red-500 text-white placeholder-white::placeholder rounded ${
                      errors.orderId ? "border-2 border-yellow-400" : ""
                    }`}
                    placeholder="amazon order id"
                    required
                  />
                  {errors.orderId && (
                    <p className="text-yellow-400 mt-1">{errors.orderId}</p>
                  )}
                </div>
                <button
                  onClick={handleNextStep}
                  className="inline-block bg-red-500 text-white font-bold py-3 px-12 rounded text-xl hover:bg-red-600 transition duration-300"
                >
                  Next
                </button>
              </form>
            </div>
          </div>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4 ">
          <div className="max-w-4xl w-full">
            <div className="relative">
              <div className="absolute -left-10 top-0 -translate-x-1/2 z-50 -rotate-6">
                <img
                  src={Photo3}
                  width={250}
                  height={300}
                  alt="Don't put off until tomorrow what you can do today."
                  className="rounded-lg shadow-md"
                />
              </div>
              <div className="absolute -left-20 top-40 -translate-x-1/3 rotate-12 z-40">
                <img
                  src={Photo4}
                  width={250}
                  height={300}
                  alt="No dejes para mañana lo que puedes hacer hoy."
                  className="rounded-lg shadow-md"
                />
              </div>
              <form className="space-y-6 ml-32">
                <div>
                  <label htmlFor="address" className="block text-lg mb-2">
                    Where can I send your gift?
                  </label>
                  <p>
                    Please include your full address, city, zip code, etc., so
                    it doesn't get lost.
                  </p>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={`w-full p-3 bg-red-500 text-white placeholder-white::placeholder rounded ${
                      errors.address ? "border-2 border-yellow-400" : ""
                    }`}
                    placeholder="full address"
                    required
                  />
                  {errors.address && (
                    <p className="text-yellow-400 mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-lg mb-2">
                    What is your best email address?
                  </label>
                  <p>
                    I will use this for tracking information and future deals,
                    as well as tips to help with your learning!
                  </p>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full p-3 bg-red-500 text-white placeholder-white::placeholder rounded ${
                      errors.email ? "border-2 border-yellow-400" : ""
                    }`}
                    placeholder="valid email"
                    required
                  />
                  {errors.email && (
                    <p className="text-yellow-400 mt-1">{errors.email}</p>
                  )}
                </div>
                <button
                  onClick={handleSubmit}
                  className="inline-block bg-red-500 text-white font-bold py-3 px-12 rounded text-xl hover:bg-red-600 transition duration-300"
                >
                  Next
                </button>
              </form>
            </div>
          </div>
        </div>
      );
    }
    if (step === 3) {
      return (
        <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
          <div className="max-w-6xl w-full flex flex-col md:flex-row items-center md:items-start">
            <div className="md:w-2/3 space-y-6 text-center md:text-left">
              <h1 className="text-4xl font-bold">
                Thank you, {formData.name}!
              </h1>
              <p className="text-xl">
                I'm so excited for you to use it! I'll personally make sure
                everything goes smoothly.
              </p>
              <p className="text-lg">
                It's a beautiful day! Please let me know how I did with your
                current set. Your honest feedback helps me create better
                learning tools for learners like you.
              </p>
              <p className="text-lg">
                I'd love to hear your ideas and thoughts.
              </p>
              <button
                onClick={() =>
                  window.open(
                    `https://www.amazon.com/review/create-review/?ie=UTF8&channel=glance-detail&asin=${asin}`,
                    "_blank"
                  )
                }
                className="block w-full bg-red-500 text-white text-center py-3 rounded-lg text-xl font-semibold hover:bg-red-600 transition duration-300"
              >
                Share my feedback
              </button>
              <p className="text-gray-600">This will NOT affect your gift.</p>
            </div>
            <div className="md:w-1/3 relative h-64 md:h-auto">
              <div className="absolute top-0 right-0 w-48 h-48 transform rotate-12">
                <img
                  src={Photo5}
                  width={250}
                  height={300}
                  alt="I understand"
                  layout="fill"
                  objectFit="contain"
                  className="rounded-lg shadow-md"
                />
              </div>
              <div className="absolute top-16 right-16 w-48 h-48 transform -rotate-6">
                <img
                  src={Photo6}
                  alt="I understand"
                  width={250}
                  height={300}
                  layout="fill"
                  objectFit="contain"
                />
              </div>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl md:max-w-4xl w-full text-center space-y-6">
          <h1 className="text-4xl font-bold text-gray-800">Hiiiiii....</h1>
          <p className="text-xl md:text-4xl text-gray-700 leading-relaxed">
            Since you took the leap to start your learning journey, I wanted to
            give you this gift to add a little fun and soul.
          </p>
          <p className="text-xl md:text-4xl text-gray-700 leading-relaxed">
            It took me a few months to create and perfect this gift, but I
            wanted it to have the perfect balance! I hope you enjoy it!
          </p>
          <p className="text-xl md:text-4xl text-gray-700">
            With love,
            <br />
            <span className="font-semibold">Nafiseh</span>
          </p>
          <p className="text-lg text-gray-600 font-semibold italic">
            Founder & Fellow Spanish Lover
          </p>
          <div className="pt-6">
            <button
              onClick={handleNextStep}
              className="inline-block bg-red-500 text-white font-bold py-3 px-12 rounded text-xl hover:bg-red-600 transition duration-300"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <>
        <div className="min-h-screen bg-blue-100 flex items-center justify-center p-4">
          <div className="w-full max-w-screen-2xl mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="w-full md:w-1/2 text-center mb-8 md:mb-0 pr-0 md:pr-8">
              <h1 className="text-4xl md:text-6xl font-script mb-6">
                Congratulation!
              </h1>
              <p className="text-xl md:text-3xl text-blue-400 mb-8">
                You are one of our 250 lucky learners to win our Soul Delight
                pack!
              </p>
              <button
                onClick={claimReward}
                className="inline-block bg-red-500 text-white font-bold py-4 px-8 rounded-full text-xl hover:bg-red-600 transition duration-300"
              >
                Claim your gift now!
              </button>
            </div>
            <div className="w-full md:w-1/2 relative">
              <img
                src={IntroPhoto}
                width={600}
                height={500}
                alt="Study Key Soul Delight pack"
                className="rounded-lg shadow-md w-full h-auto"
              />
            </div>
          </div>
        </div>
      </>
    </>
  );
}

export default Form;
