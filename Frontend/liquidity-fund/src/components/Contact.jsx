import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const Contact = () => {
  const [status, setStatus] = useState('Send Message');
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Sending...');

    const form = e.target;
    const data = new FormData(form);

    try {
      const response = await fetch('https://formspree.io/f/xwpqqdqy', {
        method: 'POST',
        body: data,
        headers: {
          Accept: 'application/json',
        },
      });

      if (response.ok) {
        setStatus('Message Sent!');
        form.reset();
        setFormData({ name: '', email: '', message: '' });
      } else {
        setStatus('Failed to Send');
      }
    } catch (error) {
      setStatus('Network Error');
    }

    setTimeout(() => setStatus('Send Message'), 4000);
  };

  const contactInfo = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Email',
      value: 'brian.mwalish@email.com',
      link: 'mailto:brian.mwalish@email.com',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      ),
      label: 'LinkedIn',
      value: 'linkedin.com/in/brianmwalish',
      link: 'https://linkedin.com/in/brianmwalish',
      gradient: 'from-blue-600 to-blue-800'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.300 24 12c0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      label: 'GitHub',
      value: 'github.com/Brian2021-Mwalish',
      link: 'https://github.com/Brian2021-Mwalish',
      gradient: 'from-gray-700 to-gray-900'
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      label: 'Location',
      value: 'Nairobi, Kenya',
      link: null,
      gradient: 'from-emerald-500 to-teal-500'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const getButtonStyle = () => {
    switch (status) {
      case 'Sending...':
        return 'bg-yellow-500 text-white cursor-not-allowed';
      case 'Message Sent!':
        return 'bg-green-500 text-white cursor-default';
      case 'Failed to Send':
      case 'Network Error':
        return 'bg-red-500 text-white hover:bg-red-600';
      default:
        return 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600';
    }
  };

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 py-20 px-4 sm:px-6 lg:px-8"
    >
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-full blur-3xl top-1/4 left-1/4" />
        <div className="absolute w-80 h-80 bg-gradient-to-r from-purple-500/8 to-pink-500/8 rounded-full blur-3xl bottom-1/4 right-1/4" />
      </div>

      <motion.div
        className="relative z-10 max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Let's Work Together
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Have a project in mind or want to discuss opportunities? I'd love to hear from you. 
            Let's create something amazing together.
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 mx-auto rounded-full mt-8" />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Contact Info */}
          <motion.div variants={itemVariants} className="space-y-8">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Get In Touch</h3>
              <p className="text-gray-300 leading-relaxed mb-8">
                I'm always open to discussing new projects, creative ideas, or opportunities to be part of your vision. 
                Whether you need a full-stack developer, have questions about my work, or just want to connect, 
                don't hesitate to reach out.
              </p>

              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    className="flex items-center space-x-4 group"
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${info.gradient} rounded-xl flex items-center justify-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                      {info.icon}
                    </div>
                    <div>
                      <p className="text-sm text-gray-400 font-medium">{info.label}</p>
                      {info.link ? (
                        <a
                          href={info.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-white hover:text-cyan-400 transition-colors duration-200 break-all"
                        >
                          {info.value}
                        </a>
                      ) : (
                        <p className="text-white">{info.value}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Availability Status */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6"
            >
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <div>
                  <p className="text-white font-semibold">Available for New Projects</p>
                  <p className="text-green-300 text-sm">Currently open for freelance and full-time opportunities</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Contact Form */}
          <motion.div variants={itemVariants}>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Send Me a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-gray-300">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Brian Mwalish"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 backdrop-blur-sm transition-all duration-200"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="brianmwalish@gmail.com"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 backdrop-blur-sm transition-all duration-200"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-300">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={6}
                    placeholder="Tell me about your project or how I can help..."
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 backdrop-blur-sm transition-all duration-200 resize-none"
                    required
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={status === 'Sending...' || status === 'Message Sent!'}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${getButtonStyle()}`}
                  whileHover={status === 'Send Message' ? { scale: 1.02 } : {}}
                  whileTap={status === 'Send Message' ? { scale: 0.98 } : {}}
                >
                  {status === 'Sending...' && (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  {status === 'Message Sent!' && (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  <span>{status}</span>
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>

        {/* Footer Message */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/20 rounded-2xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">
              Let's Build Something Great
            </h3>
            <p className="text-gray-300 leading-relaxed">
              Whether you have a clear vision or just an idea, I'm here to help bring it to life. 
              Every great project starts with a conversation. Let's start ours today.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Contact;