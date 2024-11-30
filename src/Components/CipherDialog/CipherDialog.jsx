import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CipherDialog.css'; // Updated CSS file

const CipherDialog = ({ onClose, onSuccess }) => {
    const [encryptedWord, setEncryptedWord] = useState('');
    const [decryptedWord, setDecryptedWord] = useState('');
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        // Fetch encrypted word from backend
        const fetchEncryptedWord = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post(
                    'http://localhost:5000/api/user/generate-cipher',
                    {},
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                setEncryptedWord(response.data.encryptedWord);

                // Trigger print functionality after the word is loaded
                window.print();
            } catch (error) {
                console.error('Error fetching encrypted word:', error);
                setMessage('Failed to load cipher. Please try again.');
            }
        };

        fetchEncryptedWord();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!decryptedWord) {
            setMessage('Please enter the decrypted word.');
            return;
        }

        try {
            setIsSubmitting(true);
            const token = localStorage.getItem('token');
            const response = await axios.post(
                'http://localhost:5000/api/user/verify-cipher',
                { decryptedWord },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            setMessage(response.data.message);
            onSuccess(); // Notify parent component about success
        } catch (error) {
            console.error('Error verifying cipher:', error);
            setMessage(
                error.response?.data?.message ||
                    'Verification failed. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="cipher-dialog-overlay">
            <div className="cipher-dialog">
                <button className="close-button" onClick={onClose}>
                    ×
                </button>
                <h3>Solve the Cipher</h3>
                <p>Here's the encrypted word:</p>
                <p className="encrypted-word">{encryptedWord}</p>
                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        placeholder="Type in decrypted word"
                        value={decryptedWord}
                        onChange={(e) => setDecryptedWord(e.target.value)}
                        required
                    />
                    <button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Checking...' : 'Check'}
                    </button>
                </form>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default CipherDialog;
