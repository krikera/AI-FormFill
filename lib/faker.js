// Simplified Faker implementation for the extension
const faker = {
  person: {
    firstName() {
      const names = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emma', 'James', 'Olivia', 'William', 'Sophia'];
      return names[Math.floor(Math.random() * names.length)];
    },
    lastName() {
      const names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
      return names[Math.floor(Math.random() * names.length)];
    },
    fullName() {
      return `${this.firstName()} ${this.lastName()}`;
    },
    email() {
      const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com'];
      const domain = domains[Math.floor(Math.random() * domains.length)];
      return `${this.firstName().toLowerCase()}.${this.lastName().toLowerCase()}@${domain}`;
    }
  },
  phone: {
    number() {
      return `+1${Math.floor(Math.random() * 9000000000 + 1000000000)}`;
    }
  },
  address: {
    streetAddress() {
      const streets = ['Main St', 'Oak Ave', 'Maple Dr', 'Cedar Ln', 'Pine Rd'];
      const street = streets[Math.floor(Math.random() * streets.length)];
      return `${Math.floor(Math.random() * 9999) + 1} ${street}`;
    },
    city() {
      const cities = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
      return cities[Math.floor(Math.random() * cities.length)];
    },
    state() {
      const states = ['CA', 'NY', 'TX', 'FL', 'IL'];
      return states[Math.floor(Math.random() * states.length)];
    },
    zipCode() {
      return Math.floor(Math.random() * 90000 + 10000).toString();
    },
    fullAddress() {
      return `${this.streetAddress()}, ${this.city()}, ${this.state()} ${this.zipCode()}`;
    }
  },
  internet: {
    password(length = 12) {
      const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
      let password = '';
      for (let i = 0; i < length; i++) {
        password += chars[Math.floor(Math.random() * chars.length)];
      }
      return password;
    }
  },
  finance: {
    creditCardNumber() {
      return Math.floor(Math.random() * 9000000000000000 + 1000000000000000).toString();
    },
    creditCardCVV() {
      return Math.floor(Math.random() * 900 + 100).toString();
    },
    creditCardExpiration() {
      const month = Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0');
      const year = (new Date().getFullYear() + Math.floor(Math.random() * 5 + 1)).toString().slice(-2);
      return `${month}/${year}`;
    }
  }
};

export default faker; 