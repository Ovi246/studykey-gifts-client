import { useState } from "react";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import { toast } from "react-toastify";
import axios from "axios";
import Fireworks from "@fireworks-js/react";
import Popup from "reactjs-popup";

// Your form component
function Form() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [asin, setAsin] = useState();
  const [formData, setFormData] = useState({
    productName: "",
    satisfaction: null,
    orderId: "",
    duration: "",
    firstName: "",
    lastName: "",
    email: "",
    address: "",
    city: "",
    zip: "",
    state: "",
    newsletter: "",
    reviews: "",
  });
  const [isCorrect, setIsCorrect] = useState(false);
  const [answer, setAnswer] = useState("");
  const [attempts, setAttempts] = useState(3);
  const [showFireworks, setShowFireworks] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);

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

  const handleNextStep = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (step === 2) {
      try {
        const response = await axios.post(
          "https://studykey-riddles-server.vercel.app/validate-order-id",
          formData,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status !== 200) {
          toast.error(
            "Order ID does not match. Please make sure to put the correct Amazon order number."
          );
          setLoading(false);
          throw new Error("Non-200 status code");
        }

        setAsin(response.data.asins[0]);
      } catch (error) {
        console.error(error);
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
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    // Handle form submission
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

  if (!showFeedbackForm) {
    return (
      <div className="h-screen w-screen flex flex-col gap-10 items-center justify-center bg-gradient-to-br from-blue-500 to-pink-500 font-poppins">
        <img
          alt="Logo"
          className="rounded-full border aspect-square object-contain mx-auto"
          height="200"
          src="logo.png"
          width="200"
        />
        <div className="min-h-[250px] w-[700px] rounded-xl bg-white bg-opacity-30 backdrop-blur-[10px] p-6 text-white flex flex-col items-center justify-center">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Can you solve the riddle?
            </h1>
          </div>
          <p className="text-lg font-semibold leading-none border-2 border-white rounded-md p-4 mt-5 text-center w-3/2">
            I'm a pack of fun, now wrapping, just cards in a stack, Each one's a
            gem, knowledge that won't lack. Flip me around, see what's in store,
            A gift for your brain, a learning encore, Give it a whirl, I'm the
            flashiest thing in your study world! What am I?
          </p>
          <div className="flex flex-col gap-4 min-[400px]:flex-row mt-5">
            <input
              className="max-w-sm bg-transparent border-b-2 border-t-2 placeholder-white placeholder-opacity-50 py-2 px-4 rounded-md"
              placeholder="Enter your answer"
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <button
              className="bg-white bg-opacity-30 backdrop-blur-[10px]text-white shadow-md p-2 rounded-md"
              onClick={checkAnswer}
            >
              Submit
            </button>
          </div>
          {attempts < 3 && <p>Remaining attempts: {attempts}</p>}
        </div>
        {isCorrect && (
          <Popup
            open={showReward}
            closeOnDocumentClick
            onClose={() => setShowReward(false)}
            modal
            nested
          >
            <div className="modal bg-white p-5 rounded-lg flex flex-col gap-5">
              <h1 className="text-xl font-bold">Congratulations!</h1>
              <p>You've correctly answered the riddle!</p>
              <button
                onClick={claimReward}
                className="bg-black text-white px-3 py-2 rounded-md"
              >
                Claim your free reward!
              </button>
            </div>
          </Popup>
        )}
        {showFireworks && (
          <Fireworks
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 9999,
              pointerEvents: "none",
            }}
            options={{
              speed: 3,
              count: 200,
              gravity: 0.3,
              explosion: 50,
              duration: 2 * 1000,

              calc: (props, i) => ({
                ...props,
                x:
                  (i % 2) * window.innerWidth -
                  (i / 2) * window.innerWidth +
                  (i % 2) * 100 -
                  50,
                y:
                  window.innerHeight -
                  200 +
                  Math.random() * 100 -
                  50 +
                  (i === 2 ? -80 : 0),
              }),
            }}
          />
        )}
      </div>
    );
  }

  return (
    <>
      {showFeedbackForm && (
        <div className="max-w-2xl mx-auto p-6">
          <div className="text-3xl font-bold my-8">Feedback Form</div>
          <div className="flex justify-between items-center mb-8">
            <div
              className={`w-8 h-8 text-white rounded-full flex items-center justify-center ${
                step >= 1 ? "bg-black" : "bg-gray-300"
              }`}
              onClick={() => handleStepClick(1)}
            >
              1
            </div>
            <div
              className={`flex-grow h-1 ${
                step >= 2 ? "bg-black" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`w-8 h-8 text-white rounded-full flex items-center justify-center ${
                step >= 2 ? "bg-black" : "bg-gray-300"
              }`}
              onClick={() => handleStepClick(2)}
            >
              2
            </div>
            <div
              className={`flex-grow h-1 ${
                step >= 3 ? "bg-black" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`w-8 h-8 text-white rounded-full flex items-center justify-center ${
                step >= 3 ? "bg-black" : "bg-gray-300"
              }`}
              onClick={() => handleStepClick(3)}
            >
              3
            </div>
            <div
              className={`flex-grow h-1 ${
                step >= 4 ? "bg-black" : "bg-gray-300"
              }`}
            ></div>
            <div
              className={`w-8 h-8 text-white rounded-full flex items-center justify-center ${
                step >= 4 ? "bg-black" : "bg-gray-300"
              }`}
              onClick={() => handleStepClick(4)}
            >
              4
            </div>
          </div>
          <SwitchTransition>
            <CSSTransition key={step} timeout={500} classNames="fade">
              <>
                {step === 1 && (
                  <form onSubmit={handleSubmit}>
                    <h2 className="text-2xl font-semibold mb-4">
                      PLEASE TELL US WHICH PRODUCT YOU’VE PURCHASED.
                    </h2>
                    <div className="mb-6">
                      <label
                        className="block text-sm font-medium mb-2"
                        htmlFor="product"
                      >
                        Which product did you purchase? *
                      </label>
                      <input
                        id="product"
                        placeholder="Product name"
                        className="..."
                        name="productName"
                        onChange={handleInputChange}
                      />
                    </div>
                    <fieldset className="mb-6">
                      <legend className="text-sm font-medium mb-2">
                        How do you feel about this product?
                      </legend>
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="very-satisfied"
                            className="..."
                            name="satisfaction"
                            value="very-satisfied"
                            onChange={handleInputChange}
                          />
                          <label className="text-sm" htmlFor="very-satisfied">
                            Very Satisfied
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="somewhat-satisfied"
                            className="..."
                            name="satisfaction"
                            value="very-satisfied"
                            onChange={handleInputChange}
                          />
                          <label className="text-sm" htmlFor="very-satisfied">
                            Somewhat Satisfied
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="neutral-satisfied"
                            className="..."
                            name="satisfaction"
                            value="very-satisfied"
                            onChange={handleInputChange}
                          />
                          <label className="text-sm" htmlFor="very-satisfied">
                            Neither Satisfied nor Dissatisfied
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="somewhat-dissatisfied"
                            className="..."
                            name="satisfaction"
                            value="very-dissatisfied"
                            onChange={handleInputChange}
                          />
                          <label className="text-sm" htmlFor="very-satisfied">
                            Somewhat Dissatisfied
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="very-dissatisfied"
                            className="..."
                            name="satisfaction"
                            value="very-dissatisfied"
                            onChange={handleInputChange}
                          />
                          <label className="text-sm" htmlFor="very-satisfied">
                            Very Dissatisfied
                          </label>
                        </div>
                      </div>
                    </fieldset>
                    <fieldset className="mb-6">
                      <legend className="text-sm font-medium mb-2">
                        Have you been using this product for at least 7 days? *
                      </legend>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="yes"
                            name="duration"
                            value="yes"
                            className="..."
                            onChange={handleInputChange}
                          />
                          <label htmlFor="yes">Yes</label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="radio"
                            id="no"
                            name="duration"
                            value="no"
                            className="..."
                            onChange={handleInputChange}
                          />
                          <label htmlFor="no">No</label>
                        </div>
                      </div>
                    </fieldset>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleNextStep}
                      className="p-4 rounded-lg border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full bg-black text-white"
                    >
                      Continue
                    </button>
                  </form>
                )}
                {step === 2 && (
                  <form onSubmit={handleNextStep}>
                    <h2 className="text-2xl font-semibold my-5 uppercase">
                      Please enter your information with amazon order number.
                    </h2>
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div>
                        <label
                          htmlFor="first-name"
                          className="block text-sm font-medium mb-2"
                        >
                          First Name *
                        </label>
                        <input
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          id="first-name"
                          placeholder="First Name"
                          name="firstName"
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="last-name"
                          className="block text-sm font-medium mb-2"
                        >
                          Last Name *
                        </label>
                        <input
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          id="last-name"
                          placeholder="Last Name"
                          name="lastName"
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="order-id"
                          className="block text-sm font-medium mb-2"
                        >
                          Amazon Order ID *
                        </label>
                        <input
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          id="order-id"
                          placeholder="Order ID"
                          name="orderId"
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium mb-2"
                        >
                          Email Address *
                        </label>
                        <input
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          id="email"
                          placeholder="Email Address"
                          name="email"
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="street"
                          className="block text-sm font-medium mb-2"
                        >
                          Street Address *
                        </label>
                        <input
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          id="street"
                          placeholder="Street Address"
                          name="address"
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="city"
                          className="block text-sm font-medium mb-2"
                        >
                          City *
                        </label>
                        <input
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          id="city"
                          placeholder="City"
                          name="city"
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="zip"
                          className="block text-sm font-medium mb-2"
                        >
                          ZIP Code *
                        </label>
                        <input
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          id="zip"
                          placeholder="ZIP Code"
                          name="zip"
                          onChange={handleInputChange}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="state"
                          className="block text-sm font-medium mb-2"
                        >
                          State *
                        </label>
                        <input
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          id="state"
                          placeholder="State"
                          name="state"
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-span-2">
                        <fieldset>
                          <legend className="text-sm font-medium mb-2">
                            Please send me special offers
                          </legend>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="yes"
                                name="newsletter"
                                value="yes"
                                className="..."
                                onChange={handleInputChange}
                              />
                              <label htmlFor="yes">Yes</label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="no"
                                name="newsletter"
                                value="no"
                                className="..."
                                onChange={handleInputChange}
                              />
                              <label htmlFor="no">No</label>
                            </div>
                          </div>
                        </fieldset>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="p-4 rounded-lg border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full bg-black text-white"
                    >
                      Continue
                    </button>
                  </form>
                )}
                {step === 3 && (
                  <>
                    {formData.satisfaction === "very-satisfied" && (
                      <form onSubmit={handleSubmit}>
                        <div className="max-w-2xl mx-auto p-8">
                          <h1 className="text-3xl font-bold text-center mb-4">
                            PLEASE SHARE YOUR EXPERIENCE!
                          </h1>
                          <p className="text-lg text-center mb-4">
                            We would love to earn your product feedback! You can
                            copy your review below and share your product
                            experience on Amazon. It would really help our small
                            business. Thank you!
                          </p>
                          <div className="flex justify-center my-6">
                            <img
                              alt="Amazon logo"
                              className="h-20"
                              height="80"
                              src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
                              style={{
                                aspectRatio: "240/80",
                                objectFit: "contain",
                              }}
                              width="240"
                            />
                          </div>
                          <div className="flex justify-center mb-6">
                            <StarIcon className="text-yellow-400 w-8 h-8" />
                            <StarIcon className="text-yellow-400 w-8 h-8" />
                            <StarIcon className="text-yellow-400 w-8 h-8" />
                            <StarIcon className="text-yellow-400 w-8 h-8" />
                            <StarIcon className="text-yellow-400 w-8 h-8" />
                          </div>
                          <label
                            className="block text-lg font-medium mb-2"
                            htmlFor="review-comments"
                          >
                            Review / Comments (Minimum 150 characters to be
                            eligible for your free item) *
                          </label>
                          <textarea
                            className="flex min-h-[80px] border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full p-4 border rounded-md mb-6"
                            id="review-comments"
                            placeholder="Type your review here."
                            name="reviews"
                            onChange={handleInputChange}
                          />
                          <a
                            href={`https://www.amazon.com/review/create-review?asin=${asin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 bg-blue-600 text-white py-3 px-6 rounded-md mb-4"
                          >
                            CLICK TO POST A REVIEW ON AMAZON
                          </a>
                          <button
                            type="button"
                            disabled={loading}
                            onClick={handleNextStep}
                            className="mt-10 inline-flex items-center justify-center w-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 bg-black text-white py-3 px-6 rounded-md"
                          >
                            SUBMIT AND GET YOUR FREE ITEM!
                          </button>
                        </div>
                      </form>
                    )}
                    {formData.satisfaction === "very-dissatisfied" && (
                      <form onSubmit={handleSubmit}>
                        <div className="max-w-2xl mx-auto p-8">
                          <h1 className="text-3xl font-bold text-center mb-4">
                            PLEASE SHARE YOUR EXPERIENCE!
                          </h1>

                          <label
                            className="block text-lg font-medium mb-2"
                            htmlFor="review-comments"
                          >
                            Review / Comments (Minimum 150 characters to be
                            eligible for your free item) *
                          </label>
                          <textarea
                            className="flex min-h-[80px] border-input bg-background text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-full p-4 border rounded-md mb-6"
                            id="review-comments"
                            placeholder="Type your review here."
                            name="reviews"
                            onChange={handleInputChange}
                          />

                          <button
                            type="submit"
                            disabled={loading}
                            className="mt-10 inline-flex items-center justify-center w-full text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-primary/90 h-10 bg-black text-white py-3 px-6 rounded-md"
                          >
                            SUBMIT AND GET YOUR FREE ITEM!
                          </button>
                        </div>
                      </form>
                    )}
                  </>
                )}
                {step === 4 && (
                  <>
                    <div className="max-w-2xl mx-auto my-10 p-6">
                      <h1 className="text-4xl font-bold text-center mb-6">
                        THANK YOU!
                      </h1>
                      <p className="text-lg text-center mb-4">
                        We value your time and appreciate your business. One of
                        our customer support representatives will reach out to
                        you soon. Enjoy your free item!
                      </p>
                      <p className="text-sm text-center">
                        *Limit one free item per household or customer. Offer
                        only valid with full-priced purchases. Proof of purchase
                        from an authorized retailer required. No additional
                        purchase is necessary. Our offer is not dependent on the
                        quality of feedback that you provide. Offer only valid
                        within the United States. Void where prohibited. Offer
                        only valid while supplies last. Subject to change or
                        cancellation at any time.
                      </p>
                    </div>
                  </>
                )}
              </>
            </CSSTransition>
          </SwitchTransition>
        </div>
      )}
    </>
  );
}

export default Form;
