import axios from 'axios';

const testLiveLogin = async () => {
    try {
        const cnic = '31103-5286493-9';
        const password = 'hrpunjaberp';

        console.log(`Testing login for ${cnic} on http://localhost:5000...`);

        const response = await axios.post('http://localhost:5000/api/auth/login', {
            cnic,
            password
        });

        console.log('Login Response:', response.data);
    } catch (err) {
        console.error('Login Failed Status:', err.response?.status);
        console.error('Login Failed Body:', err.response?.data);
        console.error('Error Message:', err.message);
    }
};

testLiveLogin();
