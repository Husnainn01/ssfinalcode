"use client"
import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

const questions = [
    {
        id: 1,
        question: "What type of vehicle are you looking for?",
        options: ["Sedan", "SUV", "Van", "Truck", "Other"]
    },
    {
        id: 2,
        question: "What's your preferred budget range?",
        options: ["Under $10,000", "$10,000-$20,000", "$20,000-$30,000", "Above $30,000"]
    },
    {
        id: 3,
        question: "When are you planning to buy?",
        options: ["Within a month", "1-3 months", "3-6 months", "Just exploring"]
    }
];

const WhatsAppChat = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(-1);
    const [answers, setAnswers] = useState({});
    const [contactInfo, setContactInfo] = useState('');
    const [contactError, setContactError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showThankYou, setShowThankYou] = useState(false);
    const pathname = usePathname();
    const phoneNumber = "YOUR_PHONE_NUMBER";
    const [userChatURL, setUserChatURL] = useState('');
    const [showGreeting, setShowGreeting] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        // Create new Audio instance
        audioRef.current = new Audio('/notification.wav');
        audioRef.current.preload = 'auto'; // Preload the audio
        
        if (pathname === '/') {
            setIsVisible(true);
            
            const playNotification = async () => {
                try {
                    audioRef.current.volume = 0.7; // Increased volume to 70%
                    await audioRef.current.play();
                    console.log('Audio played successfully');
                } catch (error) {
                    console.error('Audio play failed:', error);
                }
            };

            // Show greeting and play sound after 5 seconds
            const greetingTimer = setTimeout(() => {
                setShowGreeting(true);
                playNotification(); // Play sound when greeting shows
            }, 5000);

            // Hide greeting after 10 seconds
            const hideTimer = setTimeout(() => {
                setShowGreeting(false);
            }, 15000);

            return () => {
                clearTimeout(greetingTimer);
                clearTimeout(hideTimer);
                if (audioRef.current) {
                    audioRef.current.pause();
                    audioRef.current.currentTime = 0;
                }
            };
        } else {
            setIsVisible(false);
            setShowGreeting(false);
        }
    }, [pathname]);

    // Add a function to manually trigger sound (for testing)
    const testSound = async () => {
        try {
            audioRef.current.volume = 0.7;
            await audioRef.current.play();
            console.log('Test sound played');
        } catch (error) {
            console.error('Test sound failed:', error);
        }
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Basic phone validation (minimum 10 digits)
        const phoneRegex = /^\d{10,}$/;

        if (emailRegex.test(contactInfo) || phoneRegex.test(contactInfo)) {
            setAnswers(prev => ({ ...prev, contact: contactInfo }));
            setCurrentQuestion(0);
            setContactError('');
        } else {
            setContactError('Please enter a valid email or phone number');
        }
    };

    const renderContactForm = () => (
        <div className="p-6">
            <div className="mb-6">
                <h3 className="text-gray-800 font-medium mb-2 text-lg">
                    Before we start...
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                    Please provide your contact information so we can better assist you.
                </p>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={contactInfo}
                            onChange={(e) => {
                                setContactInfo(e.target.value);
                                setContactError('');
                            }}
                            placeholder="Enter your email or phone number"
                            className="w-full px-4 py-3 rounded-lg border border-gray-200 
                                focus:border-[#25D366] focus:ring-1 focus:ring-[#25D366] 
                                outline-none transition-all duration-200"
                        />
                        {contactError && (
                            <p className="text-red-500 text-xs mt-1">{contactError}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-[#25D366] hover:bg-[#20BA5C] text-white 
                            py-3 rounded-lg transition-colors duration-200 font-medium"
                    >
                        Continue
                    </button>
                </form>
            </div>
            
            <div className="border-t border-gray-100 pt-4">
                <button
                    onClick={() => handleWhatsAppClick()}
                    className="text-sm text-gray-500 hover:text-[#25D366] transition-colors duration-200
                        flex items-center gap-1 group"
                >
                    <span>Skip to chat with agent</span>
                    <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
                </button>
            </div>
        </div>
    );

    const submitToAgent = async (finalAnswers) => {
        try {
            setIsSubmitting(true);
            const response = await fetch('/api/whatsapp-lead', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contact: contactInfo,
                    answers: finalAnswers
                }),
            });

            const data = await response.json();
            
            if (!response.ok) throw new Error('Failed to submit');

            // Try to open WhatsApp with the first URL format
            if (data.whatsappURLs && data.whatsappURLs.length > 0) {
                // Try the first URL
                window.open(data.whatsappURLs[0], '_blank');
                
                // If first fails, try the second after a short delay
                setTimeout(() => {
                    window.open(data.whatsappURLs[1], '_blank');
                }, 1000);
            }

            setShowThankYou(true);
            setTimeout(() => {
                setShowThankYou(false);
                setIsChatOpen(false);
                resetChat();
            }, 5000);

        } catch (error) {
            console.error('Error submitting lead:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAnswer = async (answer) => {
        const newAnswers = {
            ...answers,
            [questions[currentQuestion].question]: answer
        };
        
        setAnswers(newAnswers);
        
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            // All questions answered, submit to agent first
            await submitToAgent(newAnswers);
        }
    };

    const resetChat = () => {
        setCurrentQuestion(-1);
        setAnswers({});
        setContactInfo('');
        setContactError('');
    };

    const renderThankYou = () => (
        <div className="p-6 text-center">
            <div className="mb-4">
                <svg className="w-16 h-16 text-green-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
                Thank You!
            </h3>
            <p className="text-gray-600 mb-4">
                Our agent has received your preferences.
            </p>
            <div className="space-y-3">
                <button
                    onClick={() => window.open(userChatURL, '_blank')}
                    className="bg-[#25D366] text-white px-6 py-2 rounded-lg hover:bg-[#20BA5C] transition-colors w-full"
                >
                    Start Chat with Agent
                </button>
                <button
                    onClick={() => {
                        setShowThankYou(false);
                        setIsChatOpen(false);
                        resetChat();
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                >
                    Maybe Later
                </button>
            </div>
        </div>
    );

    const handleWhatsAppClick = (message = '') => {
        const whatsappURL = `https://wa.me/${+818015787658}?text=${encodeURIComponent(message)}`;
        window.open(whatsappURL, '_blank');
        setIsChatOpen(false);
        setCurrentQuestion(0);
        setAnswers({});
    };

    const handleSkip = () => {
        handleWhatsAppClick("Hello! I'm interested in your vehicles and would like to speak with an agent.");
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 right-4 z-50">
            {/* Enhanced Greeting Bubble - Only this part is modified */}
            {showGreeting && !isChatOpen && (
                <div className="mb-4 bg-white rounded-xl shadow-xl p-5 w-[280px] sm:w-[320px] 
                    absolute bottom-full right-0 transform transition-all duration-300 
                    animate-fade-in-up border border-gray-100"
                >
                    <div className="relative">
                        <button 
                            onClick={() => setShowGreeting(false)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full 
                                flex items-center justify-center text-gray-400 hover:text-gray-600
                                shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                            ×
                        </button>
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] 
                                flex items-center justify-center flex-shrink-0 shadow-sm"
                            >
                                <svg 
                                    className="w-7 h-7 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771z"/>
                                </svg>
                            </div>
                            <div>
                                <h4 className="text-gray-900 font-semibold text-base mb-1">
                                    Looking for your dream car? 🚗
                                </h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Our team is here to help! Chat with us for personalized assistance.
                                </p>
                            </div>
                        </div>
                        {/* Refined chat bubble pointer */}
                        <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white transform rotate-45 
                            border-r border-b border-gray-100"
                        ></div>
                    </div>
                </div>
            )}

            {isChatOpen && (
                <div className="mb-4 bg-white rounded-xl shadow-2xl w-[320px] overflow-hidden absolute bottom-full right-0 transform transition-all duration-300 ease-out">
                    {/* Enhanced Header */}
                    <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] p-4">
                        <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        className="h-6 w-6 text-white"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771z"/>
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">Chat with Us</h3>
                                    <p className="text-white/80 text-xs">We typically reply instantly</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsChatOpen(false)}
                                className="text-white/80 hover:text-white transition-colors p-1"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {isSubmitting ? (
                        <div className="p-6 text-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#25D366] mx-auto"></div>
                            <p className="mt-2 text-gray-600">Submitting your information...</p>
                        </div>
                    ) : showThankYou ? (
                        renderThankYou()
                    ) : currentQuestion === -1 ? (
                        renderContactForm()
                    ) : (
                        <div className="p-6">
                            <div className="mb-6">
                                <p className="text-gray-800 font-medium mb-4 text-lg">
                                    {questions[currentQuestion].question}
                                </p>
                                <div className="space-y-2.5">
                                    {questions[currentQuestion].options.map((option) => (
                                        <button
                                            key={option}
                                            onClick={() => handleAnswer(option)}
                                            className="w-full text-left px-4 py-3 rounded-lg text-sm
                                                border border-gray-200 hover:border-[#25D366] hover:bg-green-50
                                                transition-all duration-200 flex items-center justify-between
                                                group hover:shadow-sm"
                                        >
                                            <span>{option}</span>
                                            <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[#25D366]">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                                                </svg>
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-100 pt-4">
                                <button
                                    onClick={handleSkip}
                                    className="text-sm text-gray-500 hover:text-[#25D366] transition-colors duration-200
                                        flex items-center gap-1 group"
                                >
                                    <span>Skip to chat with agent</span>
                                    <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Chat Button with notification dot */}
            <button
                onClick={() => {
                    setIsChatOpen(true);
                    testSound(); // Test sound on button click (for debugging)
                }}
                className="bg-[#25D366] hover:bg-[#20BA5C] text-white p-4 rounded-full 
                    shadow-lg transition-all duration-300 hover:scale-105 
                    flex items-center justify-center group relative"
                aria-label="Chat on WhatsApp"
            >
                {showGreeting && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#25D366] opacity-20"></span>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6 relative"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z"/>
                </svg>
            </button>
        </div>
    );
};

export default WhatsAppChat;