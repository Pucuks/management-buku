const User = require('./models/User');

(async () => {
    try {
        const newUser = await User.create({
            username: 'dummyuser2',
            password: 'password123', // akan di-hash otomatis lewat hook
            role: 'student',
            student_id: '2200001'
        });

        console.log('User created:', newUser.toJSON());
    } catch (error) {
        console.error('Error creating user:', error);
    }
})();
