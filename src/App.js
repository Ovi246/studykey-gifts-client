import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import PhoneInput, {
  isPossiblePhoneNumber,
  isValidPhoneNumber,
  formatPhoneNumber,
} from "react-phone-number-input";
import "react-phone-number-input/style.css";
import validator from "validator";
import {
  CitySelect,
  CountrySelect,
  StateSelect,
} from "react-country-state-city";
import "react-country-state-city/dist/react-country-state-city.css";
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
    firstName: "",
    email: "",
    set: "",
    country: { name: "United States", id: 233 },
    lastName: "",
    streetAddress: "",
    city: "",
    state: { name: "", id: null },
    zipCode: "",
    phoneNumber: "",
    reviewImage: null,
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
  const [isVerify, setIsVerify] = useState(false);

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

  // Add this debounce function at the top level
  const debounce = (func, wait) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // ZIP code validation function using API
  const validateZipCode = async (zipCode, state, city) => {
    try {
      const response = await axios.get(
        `https://api.zippopotam.us/us/${zipCode}`
      );

      const zipData = response.data;

      // Check if ZIP matches state (case-insensitive)
      const matchesState = zipData.places.some(
        (place) => place.state.toLowerCase() === state.toLowerCase()
      );

      if (!matchesState) {
        return `This ZIP code is not in ${state}`;
      }

      // More lenient city matching
      const normalizeCity = (cityName) => {
        return (
          cityName
            .toLowerCase()
            // Remove common suffixes
            .replace(/(city|town|village|heights|township)$/, "")
            // Remove special characters and extra spaces
            .replace(/[^a-z0-9]/g, "")
            .trim()
        );
      };

      const normalizedInputCity = normalizeCity(city);
      const matchesCity = zipData.places.some((place) => {
        const normalizedZipCity = normalizeCity(place["place name"]);
        // Check if either city name contains the other
        return (
          normalizedZipCity.includes(normalizedInputCity) ||
          normalizedInputCity.includes(normalizedZipCity)
        );
      });

      if (!matchesCity) {
        // Instead of error, just log a warning and allow it
        console.warn(`Warning: City name might not match ZIP code exactly`);
        return null;
      }

      return null; // Return null if validation passes
    } catch (error) {
      if (error.response?.status === 404) {
        return "Invalid ZIP code";
      }
      return "Error validating ZIP code";
    }
  };

  const validateForm = async () => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.firstName.trim()) {
        newErrors.firstName = "Name is required";
      }
      if (!formData.lastName.trim()) {
        newErrors.lastName = "Name is required";
      }

      if (!formData.set) {
        newErrors.set = "Please select a Study Key set";
      }
      if (!formData.orderId) {
        newErrors.orderId = "Order ID is required";
      }
    }

    if (step === 2) {
      // Phone validation
      if (!formData.phoneNumber) {
        newErrors.phoneNumber = "Phone number is required";
      } else if (
        !isPossiblePhoneNumber(formData.phoneNumber) ||
        !isValidPhoneNumber(formData.phoneNumber)
      ) {
        newErrors.phoneNumber = "Please enter a valid US phone number";
      }
      // Email validation
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!validator.isEmail(formData.email)) {
        newErrors.email = "Invalid email";
      }
      if (!formData.streetAddress)
        newErrors.streetAddress = "Street address is required";
      if (!formData.city) newErrors.city = "City is required";
      if (!formData.state?.name) newErrors.state = "State is required";
    }

    // ZIP code validation
    if (!formData.zipCode) {
      newErrors.zipCode = "ZIP code is required";
    } else if (formData.city && formData.state?.name) {
      const zipError = await validateZipCode(
        formData.zipCode,
        formData.state.name,
        formData.city
      );
      if (zipError) {
        newErrors.zipCode = zipError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ZIP code change handler
  const handleZipCodeChange = async (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 5);
    handleInputChange("zipCode", value);

    // Only validate when ZIP code is complete
    if (value.length === 5 && formData.city && formData.state?.name) {
      const zipError = await validateZipCode(
        value,
        formData.state.name,
        formData.city
      );
      setErrors((prev) => ({
        ...prev,
        zipCode: zipError,
      }));
    }
  };

  const handleNextStep = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setStep((prev) => prev + 1);
      setCompletedSteps((prev) => [...prev, step]);
      setLoading(false);
    }, 1000); // simulate loading time
  };

  const handleVerifyOrder = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        "https://studykey-gifts-server.vercel.app/validate-order-id",
        { orderId: formData.orderId },
        { headers: { "Content-Type": "application/json" } }
      );
      setAsin(response.data.asins[0]);
      setIsVerify(false);
    } catch (error) {
      if (error?.response?.status === 400) {
        toast.error(
          "Order ID does not match. Please make sure to put the correct Amazon order number."
        );
      } else {
        toast.error("Internal server error! Please try again later!");
      }
      setLoading(false);
      return;
    }

    setLoading(false);
  };

  const handleInputChange = (eventOrName, value) => {
    if (typeof eventOrName === "string") {
      // Handle onChange from react-country-state-city components
      setFormData({
        ...formData,
        [eventOrName]: value,
      });
      setErrors({
        ...errors,
        [eventOrName]: "",
      });
    } else {
      // Handle onChange from standard input elements
      const { name, value } = eventOrName.target;
      setFormData({
        ...formData,
        [name]: value,
      });
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  // const handleFileUpload = (event) => {
  //   const file = event.target.files[0];
  //   if (file) {
  //     setFormData(prev => ({
  //       ...prev,
  //       reviewImage: file
  //     }));
  //     setErrors(prev => ({
  //       ...prev,
  //       reviewImage: ""
  //     }));
  //   }
  // };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // if (!formData.reviewImage) {
    //   setErrors(prev => ({
    //     ...prev,
    //     reviewImage: "Please upload a screenshot of your review"
    //   }));
    //   toast.error("Please upload a screenshot of your review");
    //   return;
    // }

    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'state' || key === 'country') {
          formDataToSend.append(key, JSON.stringify(value));
        } else if (key === 'reviewImage') {
          formDataToSend.append('image', value);
        } else {
          formDataToSend.append(key, value);
        }
      });

      const response = await axios.post(
        "https://studykey-gifts-server.vercel.app/submit-review",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          // onUploadProgress: (progressEvent) => {
          //   const percentCompleted = Math.round(
          //     (progressEvent.loaded * 100) / progressEvent.total
          //   );
          //   console.log(`Upload Progress: ${percentCompleted}%`);
          // },
        }
      );
      
      if (response.status === 200) {
        toast.success("Form submitted successfully!");
        setTimeout(() => {
          setStep(step + 1);
          setCompletedSteps([...completedSteps, step]);
          setLoading(false);
        }, 1000);
      }
    } catch (error) {
      if (error.response?.data?.errorCode === "DUPLICATE_CLAIM") {
        toast.error("This order is already claimed a gift!");
      } else {
        toast.error(error.response?.data?.message || "Error submitting form");
      }
      setLoading(false);
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

  if (showFeedbackForm) {
    if (step === 1) {
      return (
        <div className="min-h-screen bg-blue-50 flex flex-col-reverse md:flex-row items-center justify-center p-4 ">
          <div className="mt-5">
            <div className=" z-50 ">
              <img
                src={Photo2}
                width={250}
                height={300}
                alt="Don't put off until tomorrow what you can do today."
                className="rounded-lg shadow-md"
              />
            </div>
            <div className="-rotate-12 z-40">
              <img
                src={Photo1}
                width={250}
                height={300}
                alt="No dejes para mañana lo que puedes hacer hoy."
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
          <form className="space-y-6 md:ml-10">
            <h1 className="text-3xl font-bold text-center mb-8">
              Here is your first step to receiving your gift!
            </h1>
            <div>
              <label htmlFor="name" className="block text-lg mb-2">
                What should I call you, my fellow language lover?
              </label>
              <div className="w-full flex gap-5 justify-between">
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-1/2 p-3 bg-red-500 text-white placeholder-white::placeholder rounded ${
                    errors.firstName ? "border-2 border-yellow-400" : ""
                  }`}
                  placeholder="FirstName"
                  required
                />
                {errors.firstName && (
                  <p className="text-yellow-400 mt-1">{errors.firstName}</p>
                )}
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-1/2 p-3 bg-red-500 text-white placeholder-white::placeholder rounded ${
                    errors.lastName ? "border-2 border-yellow-400" : ""
                  }`}
                  placeholder="LastName"
                  required
                />
                {errors.lastName && (
                  <p className="text-yellow-400 mt-1">{errors.lastName}</p>
                )}
              </div>
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
                <option value="toddlers">Toddlers English learn & Play</option>
              </select>
              {errors.set && (
                <p className="text-yellow-400 mt-1">{errors.set}</p>
              )}
            </div>
            <div>
              <label htmlFor="orderId" className="block text-lg mb-2">
                Please let me know your order number here. You can find it in
                your Amazon account under "Orders."
              </label>
              <p className="text-blue-500 my-1">(note- please enter order id exactly as provided by amazon )</p>
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
              {asin && (
                <div className="space-y-4">
                  <p className="text-lg">
                    Please share your feedback on your current product with us
                    we'd love to hear your opinion!
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
                  {/* <div className="mt-4">
                    <label className="block text-lg mb-2">
                      Upload screenshot of your review
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className={`w-full p-3 bg-red-500 text-white rounded ${
                        errors.reviewImage ? "border-2 border-yellow-400" : ""
                      }`}
                    />
                    {errors.reviewImage && (
                      <p className="text-yellow-400 mt-1">{errors.reviewImage}</p>
                    )}
                    {formData.reviewImage && (
                      <p className="text-green-500 mt-1">Screenshot uploaded successfully!</p>
                    )}
                  </div> */}
                  {/* <p className="text-gray-600">
                    *Please upload a screenshot of your review to proceed
                  </p> */}
                </div>
              )}
            </div>
            {asin ? (
              <button
                onClick={handleNextStep}
                className="inline-block bg-red-500 text-white font-bold py-3 px-12 rounded text-xl hover:bg-red-600 transition duration-300"
              >
                {loading ? "Loading..." : "Next"}
              </button>
            ) : (
              <button
                onClick={handleVerifyOrder}
                className="inline-block bg-red-500 text-white font-bold py-3 px-12 rounded text-xl hover:bg-red-600 transition duration-300"
              >
                {loading ? "Loading..." : "Verify"}
              </button>
            )}
          </form>
        </div>
      );
    }
    if (step === 2) {
      return (
        <div className="min-h-screen bg-blue-50 flex flex-col-reverse md:flex-row items-center justify-center p-4 ">
          <div className=" mt-5">
            <div className="  z-50 -rotate-6">
              <img
                src={Photo3}
                width={250}
                height={300}
                alt="Don't put off until tomorrow what you can do today."
                className="rounded-lg shadow-md"
              />
            </div>
            <div className="  rotate-12 z-40">
              <img
                src={Photo4}
                width={250}
                height={300}
                alt="No dejes para mañana lo que puedes hacer hoy."
                className="rounded-lg shadow-md"
              />
            </div>
          </div>
          <form className="space-y-6 md:ml-10" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="country" className="block text-lg mb-2">
                  Country
                </label>
                <CountrySelect
                  id="country"
                  name="country"
                  value="United States"
                  onChange={(selectedOption) =>
                    handleInputChange("country", {
                      name: "United States",
                      id: 233,
                    })
                  }
                  disabled={true}
                  defaultValue={{ name: "United States", id: 233 }}
                  required
                  placeHolder="Select Country"
                  className={{
                    control: (state) =>
                      `!bg-red-500 !border-0 !min-h-[48px] !rounded ${
                        errors.country ? "!border-2 !border-yellow-400" : ""
                      }`,
                    singleValue: () => "!text-white",
                    placeholder: () => "!text-white/70",
                    input: () => "!text-white",
                    menu: () => "!bg-red-500 !mt-1",
                    option: () => "!text-white !bg-red-500 hover:!bg-red-600",
                    container: () => "!text-white",
                  }}
                  styles={{
                    control: (base) => ({
                      ...base,
                      padding: "0.5rem",
                      backgroundColor: "rgb(239 68 68)",
                      boxShadow: "none",
                      "&:hover": {
                        borderColor: errors.country ? "#FBBF24" : "transparent",
                      },
                    }),
                    indicatorSeparator: () => ({
                      display: "none",
                    }),
                    dropdownIndicator: (base) => ({
                      ...base,
                      color: "white",
                      "&:hover": {
                        color: "white",
                      },
                    }),
                  }}
                />

                {errors.country && (
                  <p className="text-yellow-400 mt-1">{errors.country}</p>
                )}
              </div>

              <div className="col-span-2">
                <label htmlFor="streetAddress" className="block text-lg mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  id="streetAddress"
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={(e) =>
                    handleInputChange(e.target.name, e.target.value)
                  }
                  className={`w-full p-3 bg-red-500 text-white placeholder-white::placeholder rounded ${
                    errors.streetAddress ? "border-2 border-yellow-400" : ""
                  }`}
                  placeholder="Street address"
                  required
                />
                {errors.streetAddress && (
                  <p className="text-yellow-400 mt-1">{errors.streetAddress}</p>
                )}
              </div>
              <div>
                <label htmlFor="state" className="block text-lg mb-2">
                  State/Province
                </label>
                <StateSelect
                  id="state"
                  name="state"
                  countryid={233}
                  value={formData.state.name}
                  onChange={(selectedOption) =>
                    handleInputChange("state", {
                      name: selectedOption.name,
                      id: selectedOption.id,
                    })
                  }
                  className={`w-full p-3 bg-red-500 text-white rounded ${
                    errors.state ? "border-2 border-yellow-400" : ""
                  }`}
                  required
                  placeHolder="Select State"
                />
                {errors.state && (
                  <p className="text-yellow-400 mt-1">{errors.state}</p>
                )}
              </div>
              <div>
                <label htmlFor="city" className="block text-lg mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className={`w-full p-3 bg-red-500 text-white placeholder-white::placeholder rounded ${
                    errors.city ? "border-2 border-yellow-400" : ""
                  }`}
                  placeholder="Enter city name"
                  required
                />
                {errors.city && (
                  <p className="text-yellow-400 mt-1">{errors.city}</p>
                )}
              </div>
              <div>
                <label htmlFor="zipCode" className="block text-lg mb-2">
                  ZIP/Postal Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  maxLength="5"
                  value={formData.zipCode}
                  onChange={handleZipCodeChange}
                  className={`w-full p-3 bg-red-500 text-white placeholder-white::placeholder rounded ${
                    errors.zipCode ? "border-2 border-yellow-400" : ""
                  }`}
                  placeholder="ZIP code"
                  required
                />
                {errors.zipCode && (
                  <p className="text-yellow-400 mt-1">{errors.zipCode}</p>
                )}
              </div>
              <div>
                <label htmlFor="phoneNumber" className="block text-lg mb-2">
                  Phone Number
                </label>
                <PhoneInput
                  international={false}
                  defaultCountry="US"
                  countrySelectProps={{ disabled: true }}
                  value={formData.phoneNumber}
                  onChange={(value) => {
                    handleInputChange("phoneNumber", value);
                    if (value) {
                      const isValid = isPossiblePhoneNumber(value) && isValidPhoneNumber(value);
                      setErrors((prev) => ({
                        ...prev,
                        phoneNumber: isValid ? null : "Please enter a valid US phone number",
                      }));
                    }
                  }}
                  className={`w-full bg-red-500 text-white rounded ${
                    errors.phoneNumber ? "border-2 border-yellow-400" : ""
                  }`}
                  placeholder="(XXX) XXX-XXXX"
                  numberInputProps={{
                    className: "phone-input-field",
                  }}
                  required
                />

                {errors.phoneNumber && (
                  <p className="text-yellow-400 mt-1">{errors.phoneNumber}</p>
                )}
              </div>
              <div className="col-span-2">
                <label htmlFor="email" className="block text-lg mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) =>
                    handleInputChange(e.target.name, e.target.value)
                  }
                  className={`w-full p-3 bg-red-500 text-white placeholder-white::placeholder rounded ${
                    errors.email ? "border-2 border-yellow-400" : ""
                  }`}
                  placeholder="Email address"
                  required
                />
                {errors.email && (
                  <p className="text-yellow-400 mt-1">{errors.email}</p>
                )}
              </div>
            </div>
            <button
              type="submit"
              className="inline-block bg-red-500 text-white font-bold py-3 px-12 rounded text-xl hover:bg-red-600 transition duration-300"
            >
              {loading ? "Loading..." : "Submit"}
            </button>
          </form>
        </div>
      );
    }
    if (step === 3) {
      return (
        <div className="min-h-screen bg-blue-50 flex flex-col-reverse md:flex-row items-center justify-center p-4">
          <div className="mt-10 md:mx-10 ">
            <div className=" rotate-12">
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
            <div className="  -rotate-6">
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
          <div className="p-3 flex flex-col gap-5 max-w-2xl">
            <h1 className="text-4xl font-bold">Thank you, {formData.name}!</h1>
            <p className="text-xl">
              I'm so excited for you to use it! I'll personally make sure
              everything goes smoothly.
            </p>
            <p className="text-lg">
              It's a beautiful day! Please let me know how I did with your
              current set. Your honest feedback helps me create better learning
              tools for learners like you.
            </p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="max-w-2xl md:max-w-4xl w-full text-center space-y-6">
          <h1 className="text-4xl font-bold text-blue-800">Hiiiiii....</h1>
          <p className="text-xl md:text-4xl text-blue-700 leading-relaxed">
            Since you took the leap to start your learning journey, I wanted to
            give you this gift to add a little fun and soul.
          </p>
          <p className="text-xl md:text-4xl text-blue-700 leading-relaxed">
            It took me a few months to create and perfect this gift, but I
            wanted it to have the perfect balance! I hope you enjoy it!
          </p>
          <p className="text-xl md:text-4xl text-blue-700">
            With love,
            <br />
            <span className="font-semibold">Nafiseh</span>
          </p>
          <p className="text-lg text-blue-600 font-semibold italic">
            Founder & Fellow Spanish Lover
          </p>
          <div className="pt-6">
            <button
              onClick={handleNextStep}
              className="inline-block bg-red-500 text-white font-bold py-3 px-12 rounded text-xl hover:bg-red-600 transition duration-300"
            >
              {loading ? "Loading..." : "Next"}
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
