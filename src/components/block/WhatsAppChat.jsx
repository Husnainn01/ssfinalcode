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
    // Updated phone number in international format (no spaces or parentheses)
    const phoneNumber = "12625984435";
    const [userChatURL, setUserChatURL] = useState('');
    const [showGreeting, setShowGreeting] = useState(false);
    const audioRef = useRef(null);
    const chatContainerRef = useRef(null);
    const [messages, setMessages] = useState([
        { 
            id: 1, 
            text: "Hello! 👋 I'm your virtual assistant from Global Drive Motors. How can I help you today?", 
            isUser: false,
            timestamp: new Date()
        }
    ]);

    useEffect(() => {
        // Create new Audio instance
        audioRef.current = new Audio('/notification.wav');
        audioRef.current.preload = 'auto'; // Preload the audio
        
        if (pathname === '/' || true) { // Always show on all pages
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

    // Scroll to bottom of chat when messages change
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const addMessage = (text, isUser = false) => {
        const newMessage = {
            id: messages.length + 1,
            text,
            isUser,
            timestamp: new Date()
        };
        
        setMessages(prev => [...prev, newMessage]);
    };

    const handleContactSubmit = (e) => {
        e.preventDefault();
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // Basic phone validation (minimum 10 digits)
        const phoneRegex = /^\d{10,}$/;

        if (emailRegex.test(contactInfo) || phoneRegex.test(contactInfo)) {
            setAnswers(prev => ({ ...prev, contact: contactInfo }));
            
            // Add user's contact info as a message
            addMessage(`My contact: ${contactInfo}`, true);
            
            // Add virtual agent response
            setTimeout(() => {
                addMessage("Great! I'd like to ask a few questions to help you better. What type of vehicle are you interested in?");
            }, 500);
            
            setCurrentQuestion(0);
            setContactError('');
        } else {
            setContactError('Please enter a valid email or phone number');
        }
    };

    const renderContactForm = () => (
        <div className="p-6">
            <div className="mb-6">
                <h3 className="text-gray-800 font-semibold mb-2 text-lg">
                    Welcome to Global Drive Motors
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
                        Start Chat
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

            // Add a "sending to agent" message
            addMessage("Thanks for providing these details! Connecting you with an agent now...");
            
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

            // Construct WhatsApp message with all the answered questions
            let whatsappMessage = "Hello! I'm interested in your vehicles. Here are my preferences:\n\n";
            
            Object.entries(finalAnswers).forEach(([question, answer]) => {
                whatsappMessage += `${question}: ${answer}\n`;
            });
            
            whatsappMessage += `\nContact: ${contactInfo}`;
            
            // Create WhatsApp URL
            const encodedMessage = encodeURIComponent(whatsappMessage);
            const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
            setUserChatURL(whatsappURL);

            // Try to open WhatsApp
            window.open(whatsappURL, '_blank');

            setShowThankYou(true);
            setTimeout(() => {
                setShowThankYou(false);
                setIsChatOpen(false);
                resetChat();
            }, 5000);

        } catch (error) {
            console.error('Error submitting lead:', error);
            // Show error message
            addMessage("Sorry, we encountered an error connecting you to an agent. Please try again or contact us directly.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAnswer = async (answer) => {
        // Add user's answer as a message
        addMessage(answer, true);
        
        const newAnswers = {
            ...answers,
            [questions[currentQuestion].question]: answer
        };
        
        setAnswers(newAnswers);
        
        if (currentQuestion < questions.length - 1) {
            // Add virtual agent's next question after a short delay
            setTimeout(() => {
                addMessage(questions[currentQuestion + 1].question);
            }, 500);
            
            setCurrentQuestion(prev => prev + 1);
        } else {
            // Add final message before connecting to agent
            setTimeout(() => {
                addMessage("Thank you for providing all the information! I'll connect you with our sales agent now.");
            }, 500);
            
            // All questions answered, submit to agent
            await submitToAgent(newAnswers);
        }
    };

    const resetChat = () => {
        setCurrentQuestion(-1);
        setAnswers({});
        setContactInfo('');
        setContactError('');
        setMessages([
            { 
                id: 1, 
                text: "Hello! 👋 I'm your virtual assistant from Global Drive Motors. How can I help you today?", 
                isUser: false,
                timestamp: new Date()
            }
        ]);
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
                Our agent has received your preferences and will assist you shortly.
            </p>
            <div className="space-y-3">
                <button
                    onClick={() => window.open(userChatURL, '_blank')}
                    className="bg-[#25D366] text-white px-6 py-2 rounded-lg hover:bg-[#20BA5C] transition-colors w-full flex items-center justify-center gap-2"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-5 w-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771z"/>
                    </svg>
                    <span>Open WhatsApp Chat</span>
                </button>
                <button
                    onClick={() => {
                        setShowThankYou(false);
                        setIsChatOpen(false);
                        resetChat();
                    }}
                    className="text-gray-500 hover:text-gray-700 text-sm"
                >
                    Close
                </button>
            </div>
        </div>
    );

    const handleWhatsAppClick = (message = '') => {
        const defaultMessage = "Hello! I'm interested in your vehicles and would like to speak with an agent.";
        const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message || defaultMessage)}`;
        window.open(whatsappURL, '_blank');
        setIsChatOpen(false);
        resetChat();
    };

    const handleSkip = () => {
        handleWhatsAppClick("Hello! I'm interested in your vehicles and would like to speak with an agent.");
    };

    const renderChatInterface = () => (
        <div className="flex flex-col h-[400px]">
            {/* Chat messages area */}
            <div 
                ref={chatContainerRef}
                className="flex-1 p-4 overflow-y-auto bg-gray-50"
            >
                <div className="space-y-3">
                    {messages.map((msg) => (
                        <div 
                            key={msg.id} 
                            className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                        >
                            <div 
                                className={`rounded-lg px-4 py-2 max-w-[80%] ${
                                    msg.isUser 
                                        ? 'bg-[#DCF8C6] text-gray-800' 
                                        : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                                }`}
                            >
                                <p className="text-sm">{msg.text}</p>
                                <p className="text-right text-[10px] text-gray-500 mt-1">
                                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Input area or options */}
            <div className="p-4 border-t border-gray-100 bg-white">
                {currentQuestion >= 0 && currentQuestion < questions.length && (
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
                )}
                
                <div className="mt-3 border-t border-gray-100 pt-3">
                    <button
                        onClick={handleSkip}
                        className="text-sm text-gray-500 hover:text-[#25D366] transition-colors duration-200
                            flex items-center gap-1 group"
                    >
                        <span>Talk to a human agent directly</span>
                        <span className="transform translate-x-0 group-hover:translate-x-1 transition-transform">→</span>
                    </button>
                </div>
            </div>
        </div>
    );

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-24 right-4 z-50">
            {/* Enhanced Greeting Bubble */}
            {showGreeting && !isChatOpen && (
                <div className="mb-4 bg-white rounded-xl shadow-xl p-5 w-[300px] sm:w-[320px] 
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
                        {/* Chat bubble pointer */}
                        <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white transform rotate-45 
                            border-r border-b border-gray-100"
                        ></div>
                    </div>
                </div>
            )}

            {isChatOpen && (
                <div className="mb-4 bg-white rounded-xl shadow-2xl w-[350px] overflow-hidden absolute bottom-full right-0 transform transition-all duration-300 ease-out">
                    {/* Enhanced Header */}
                    <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] p-4">
                        <div className="flex justify-between items-center mb-1">
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
                                    <h3 className="text-white font-semibold">Global Drive Motors</h3>
                                    <div className="flex items-center">
                                        <span className="w-2 h-2 bg-green-300 rounded-full mr-2"></span>
                                        <p className="text-white/80 text-xs">Online | Available now</p>
                                    </div>
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
                        <div className="p-6 text-center h-[400px] flex flex-col items-center justify-center">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#25D366] mx-auto"></div>
                            <p className="mt-4 text-gray-600">Connecting you with our agent...</p>
                        </div>
                    ) : showThankYou ? (
                        renderThankYou()
                    ) : currentQuestion === -1 ? (
                        renderContactForm()
                    ) : (
                        renderChatInterface()
                    )}
                </div>
            )}

            {/* Chat Button with notification dot */}
            <button
                onClick={() => {
                    setIsChatOpen(true);
                    setShowGreeting(false);
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