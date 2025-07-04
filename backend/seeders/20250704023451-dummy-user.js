'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('123456', 10); // password di-hash

    return queryInterface.bulkInsert('users', [{
      username: 'dummyuser',
      password: hashedPassword,
      role: 'student',
      student_id: '12345678', // pastikan NIM ini ada di tabel `students`
    }], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('users', { username: 'dummyuser' }, {});
  }
};
