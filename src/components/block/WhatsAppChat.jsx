"use client"
import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { FaWhatsapp, FaTimes, FaUserCircle, FaCheckCircle } from "react-icons/fa";
import { IoSend } from "react-icons/io5";
import Link from "next/link";

const questions = [
    {
        id: "vehicleType",
        text: "What type of vehicle are you interested in?",
        options: [
            "SUV / Crossover",
            "Sedan / Sports Car",
            "Pickup Truck",
            "Minivan / Van",
            "Other / Not Sure",
        ],
    },
    {
        id: "budget",
        text: "What's your budget range?",
        options: [
            "Under $10,000",
            "$10,000 - $20,000",
            "$20,000 - $30,000",
            "$30,000 - $50,000",
            "Above $50,000",
        ],
    },
    {
        id: "timeline",
        text: "When are you looking to purchase?",
        options: [
            "As soon as possible",
            "Within 1 month",
            "1-3 months",
            "3-6 months",
            "Just browsing",
        ],
    },
];

const WhatsAppChat = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [chatStarted, setChatStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [contactInfo, setContactInfo] = useState({
        name: "",
        email: "",
        phone: "",
    });
    const [showContactForm, setShowContactForm] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const pathname = usePathname();
    const chatRef = useRef(null);
    const audioRef = useRef(null);

    // Greeting message based on current page
    const getGreeting = () => {
        if (pathname.includes("/car/")) {
            return "Hi there! I see you're viewing one of our vehicles. Would you like to know more about this car or have any questions?";
        } else if (pathname.includes("/cars")) {
            return "Hello! Looking for a specific vehicle or need help with your search? I'm here to assist you!";
        } else if (pathname.includes("/how-to-buy")) {
            return "Hi! Do you have questions about our buying process? I'm here to help you understand how it works.";
        } else if (pathname.includes("/blog")) {
            return "Hello! Enjoying our blog? If you have any questions about our articles or services, I'm here to help.";
        } else {
            return "Welcome to JDM Global! How can I assist you with your vehicle needs today?";
        }
    };

    const greeting = getGreeting();

    useEffect(() => {
        // Show chat button after a delay
        const timer = setTimeout(() => {
            setIsVisible(true);
            if (audioRef.current) {
                audioRef.current.play().catch(err => console.log("Audio play failed:", err));
            }
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Scroll to the bottom of the chat when new messages appear
        if (chatRef.current && chatStarted) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [currentQuestion, showContactForm, chatStarted]);

    const toggleChat = () => {
        setIsVisible(!isVisible);
        if (!isVisible && audioRef.current) {
            audioRef.current.play().catch(err => console.log("Audio play failed:", err));
        }
    };

    const startChat = () => {
        setChatStarted(true);
        if (audioRef.current) {
            audioRef.current.play().catch(err => console.log("Audio play failed:", err));
        }
    };

    const handleOptionSelect = (option) => {
        if (audioRef.current) {
            audioRef.current.play().catch(err => console.log("Audio play failed:", err));
        }
        
        // Save the answer
        setAnswers({
            ...answers,
            [questions[currentQuestion].id]: option,
        });
        
        // Move to next question or show contact form
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        } else {
            setShowContactForm(true);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setContactInfo({
            ...contactInfo,
            [name]: value,
        });
        
        // Clear error when user types
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: "",
            });
        }
    };

    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePhone = (phone) => {
        return /^\d{10,15}$/.test(phone.replace(/[^0-9]/g, ""));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate
        const newErrors = {};
        
        if (!contactInfo.name.trim()) {
            newErrors.name = "Name is required";
        }
        
        if (!contactInfo.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!validateEmail(contactInfo.email)) {
            newErrors.email = "Invalid email format";
        }
        
        if (!contactInfo.phone.trim()) {
            newErrors.phone = "Phone is required";
        } else if (!validatePhone(contactInfo.phone)) {
            newErrors.phone = "Invalid phone format";
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        setSubmitting(true);
        
        // Prepare data to send to agent
        const submissionData = {
            ...answers,
            contactInfo,
            page: pathname,
        };
        
        // Send to agent (replace with actual API call)
        console.log("Sending to agent:", submissionData);
        
        // Simulate API call
        setTimeout(() => {
            setSubmitting(false);
            setShowThankYou(true);
        }, 1500);
    };

    const renderContactForm = () => {
        return (
            <div className="flex flex-col space-y-4 p-3 bg-white rounded-md">
                <p className="font-medium text-gray-600 text-center">
                    Great! Please provide your contact information so our agent can assist you better:
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
                    <div>
                        <input
                            type="text"
                            name="name"
                            placeholder="Your Name"
                            value={contactInfo.name}
                            onChange={handleInputChange}
                            className={`w-full p-2 border ${
                                errors.name ? "border-red-500" : "border-gray-300"
                            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                        )}
                    </div>
                    
                    <div>
                        <input
                            type="email"
                            name="email"
                            placeholder="Your Email"
                            value={contactInfo.email}
                            onChange={handleInputChange}
                            className={`w-full p-2 border ${
                                errors.email ? "border-red-500" : "border-gray-300"
                            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                        )}
                    </div>
                    
                    <div>
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Your Phone Number"
                            value={contactInfo.phone}
                            onChange={handleInputChange}
                            className={`w-full p-2 border ${
                                errors.phone ? "border-red-500" : "border-gray-300"
                            } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        />
                        {errors.phone && (
                            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                        )}
                    </div>
                    
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition-colors disabled:bg-green-400 flex items-center justify-center space-x-2"
                    >
                        {submitting ? (
                            "Submitting..."
                        ) : (
                            <>
                                <span>Submit</span>
                                <IoSend />
                            </>
                        )}
                    </button>
                </form>
            </div>
        );
    };

    const renderThankYouMessage = () => {
        return (
            <div className="flex flex-col items-center justify-center p-4 text-center">
                <FaCheckCircle className="text-green-500 text-5xl mb-3" />
                <h3 className="font-bold text-xl mb-2">Thank You!</h3>
                <p className="text-gray-600 mb-4">
                    We've received your information. Our agent will contact you shortly!
                </p>
                <Link 
                    href={`https://wa.me/12625984435?text=Hi%20JDM%20Global,%20I'm%20interested%20in%20learning%20more%20about%20your%20vehicles.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors w-full"
                >
                    <FaWhatsapp className="text-xl" />
                    <span>Chat on WhatsApp Now</span>
                </Link>
            </div>
        );
    };

    const handleWhatsAppClick = () => {
        // WhatsApp link with custom message based on current page
        let message = "Hi JDM Global, I'm interested in learning more about";
        
        if (pathname.includes("/car/")) {
            message += " this specific vehicle I found on your website.";
        } else if (pathname.includes("/cars")) {
            message += " your vehicle inventory.";
        } else if (pathname.includes("/how-to-buy")) {
            message += " your buying process.";
        } else {
            message += " your services.";
        }
        
        window.open(
            `https://wa.me/12625984435?text=${encodeURIComponent(message)}`,
            "_blank"
        );
    };

    const skipToChat = () => {
        setShowContactForm(true);
        setChatStarted(true);
    };

    return (
        <>
            <audio ref={audioRef} src="/sounds/notification.mp3" preload="auto" />
            
            {isVisible && (
                <div className="fixed bottom-20 right-6 sm:right-8 z-50 flex flex-col items-end">
                    {/* Chat window */}
                    {chatStarted && (
                        <div className="bg-white rounded-xl shadow-lg mb-4 w-[320px] sm:w-[350px] max-w-[calc(100vw-3rem)] overflow-hidden border border-gray-200">
                            {/* Chat header */}
                            <div className="bg-green-600 text-white p-3 flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <FaUserCircle className="text-2xl" />
                                    <div>
                                        <h3 className="font-bold">JDM Global Support</h3>
                                        <p className="text-xs opacity-80">Typically replies in minutes</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleChat}
                                    className="text-white hover:bg-green-700 rounded-full p-2"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                            
                            {/* Chat body */}
                            <div
                                ref={chatRef}
                                className="max-h-[400px] overflow-y-auto p-4 bg-gray-50"
                                style={{ minHeight: "300px" }}
                            >
                                {/* Greeting bubble */}
                                <div className="flex mb-4">
                                    <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 max-w-[85%]">
                                        <p>{greeting}</p>
                                    </div>
                                </div>
                                
                                {/* Questions and answers */}
                                {!showThankYou && !showContactForm && questions.map((question, index) => {
                                    if (index > currentQuestion) return null;
                                    
                                    return (
                                        <div key={question.id} className="mb-4">
                                            {/* Question */}
                                            <div className="flex mb-3">
                                                <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 max-w-[85%]">
                                                    <p>{question.text}</p>
                                                </div>
                                            </div>
                                            
                                            {/* Answer options or selected answer */}
                                            {index === currentQuestion ? (
                                                <div className="flex flex-wrap gap-2 justify-end">
                                                    {question.options.map((option) => (
                                                        <button
                                                            key={option}
                                                            onClick={() => handleOptionSelect(option)}
                                                            className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                                                        >
                                                            {option}
                                                        </button>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex justify-end mb-3">
                                                    <div className="bg-blue-600 text-white p-3 rounded-lg shadow-sm max-w-[85%]">
                                                        <p>{answers[question.id]}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                
                                {/* Contact form */}
                                {showContactForm && !showThankYou && renderContactForm()}
                                
                                {/* Thank you message */}
                                {showThankYou && renderThankYouMessage()}
                            </div>
                        </div>
                    )}
                    
                    {/* Chat button */}
                    {!chatStarted ? (
                        <div className="bg-white p-3 rounded-xl shadow-lg flex flex-col items-center space-y-3">
                            <button
                                onClick={startChat}
                                className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg flex items-center justify-center space-x-2 transition-colors w-full"
                            >
                                <FaWhatsapp className="text-xl" />
                                <span>Start Chat with an Agent</span>
                            </button>
                            
                            <button
                                onClick={handleWhatsAppClick}
                                className="text-green-600 hover:text-green-700 text-sm underline"
                            >
                                Open WhatsApp Directly
                            </button>
                            
                            <button
                                onClick={toggleChat}
                                className="text-gray-500 hover:text-gray-700 text-sm"
                            >
                                Maybe Later
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={toggleChat}
                            className="bg-green-600 hover:bg-green-700 p-4 rounded-full shadow-lg text-white transition-colors"
                        >
                            {isVisible ? <FaTimes /> : <FaWhatsapp className="text-xl" />}
                        </button>
                    )}
                </div>
            )}
            
            {!isVisible && (
                <button
                    onClick={toggleChat}
                    className="fixed bottom-6 right-6 z-50 bg-green-600 hover:bg-green-700 p-4 rounded-full shadow-lg text-white transition-colors"
                >
                    <FaWhatsapp className="text-xl" />
                </button>
            )}
        </>
    );
};

export default WhatsAppChat;