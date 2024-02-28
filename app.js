const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const PageItem = require('./models/pageitem');
const db = require('./db');
const {json} = require("express");
const https = require('https')
const fs = require("fs");
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'pepperoni', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use('/static',express.static(path.join(__dirname, 'public')));

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return done(null, false, { message: 'Incorrect username or password.' });
    }
    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return done(null, false, { message: 'Incorrect username or password.' });
    }
    return done(null, user);
  } catch (error) {
    return done(error);
  }
}));
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});
const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  res.redirect('/');
};


app.get('/register', (req, res) => {
  res.render('register',{message:false});
});

app.post('/register', async (req, res) => {
  try {
    //const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username,
      password: req.body.password,
      email: req.body.email,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      age: req.body.age,
      country: req.body.country,
      gender: req.body.gender,
      role: 'regular'
    });
    await user.save();
    await sendMail(req.body.email, "Registration", "Thanks for signing up for our final project!")
    res.render('login',{message:false});
  } catch (error) {
    console.error(error);
    res.render('register',{message:req.body.username});
    //res.status(500).send('An error occurred during registration.');
  }
});

app.get('/login', (req, res) => {
  res.render('login',{message:false});
});

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.render('login', { message: info.message });
    }
    req.logIn(user, async (err) => {
      if (err) {
        return next(err);
      }
      await sendMail(user.email, "New login","Someone has logged into your account at "+ new Date())
      return res.redirect('/');
    });
  })(req, res, next);
});

app.get('/adminpanel', isAdmin, (req, res) => {
  res.render('adminpanel');
});

app.get('/additem', isAdmin, (req, res) => {
  res.render('itemForm');
});

app.post('/additem', isAdmin, async (req, res) => {
  try {
    const { image1,image2,image3, title_en, title_ru, description_en, description_ru } = req.body;
    const images = [image1, image2, image3];
    const newPageItem = new PageItem({
      images: images,
      title: {
        en: title_en,
        ru: title_ru
      },
      description: {
        en: description_en,
        ru: description_ru
      }
    });
    await newPageItem.save();
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while adding the page item.');
  }
});

app.get('/edititem', isAdmin,async (req,res) =>{
  try {
    const pageItem = await PageItem.findOne({_id:req.query.itemId});
    res.render('editForm',{item:pageItem});
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching page item.');
  }
})

app.post('/edititem', isAdmin, async (req, res) => {
  try {

    const {title_en,title_ru,description_en,description_ru,image1,image2,image3,id} = req.body;

    const images = [image1, image2, image3];

    const update = {
      title: { en: title_en, ru: title_ru },
      description: { en: description_en, ru: description_ru },
      images: images
    };
    const updatedItem = await PageItem.findOneAndUpdate({_id:id}, update);
    if (!updatedItem) {
      return res.status(404).send('Item not found');
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Failed to edit page item.');
  }
});

app.get('/delete', isAdmin,async (req,res) =>{
  try {
    const pageItem = await PageItem.findOneAndDelete({_id:req.query.itemId});
    if (!pageItem) {
      return res.status(404).send('Item not found');
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching page item.');
  }
})

app.get('/api/items', async (req, res) => {
  try {
    const pageItems = await PageItem.find({});
    res.json(pageItems);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred while fetching page items.');
  }
});

app.get('/crypto', (req, res) => {
  res.render('crypto');
});

app.get('/api/crypto', async (req, res) => {
  try {
    const options = {
      hostname: 'api.coingecko.com',
      port: 443,
      path: '/api/v3/simple/price?ids=bitcoin,ethereum,litecoin&vs_currencies=usd',
      method: 'GET'
    };
    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        try {
          const cryptoData = {};
          const parsedData = JSON.parse(data);
          Object.keys(parsedData).forEach(crypto => {
            cryptoData[crypto] = parsedData[crypto].usd;
          });
          res.json(cryptoData);
        } catch (error) {
          console.error('Error parsing cryptocurrency data:', error);
          res.status(500).send('Internal Server Error');
        }
      });
    });
    request.on('error', (error) => {
      console.error('Error fetching cryptocurrency data:', error);
      res.status(500).send('Internal Server Error');
    });
    request.end();
  } catch (error) {
    console.error('Error fetching cryptocurrency data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/api/area', async (req, res) => {
  try {
    const options = {
      hostname: 'restcountries.com',
      port: 443,
      path: '/v3.1/all',
      method: 'GET'
    };
    const request = https.request(options, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        try {
          const countriesData = JSON.parse(data).map(country => ({
            name: country.name.common,
            //population: country.population,
            area: country.area,
            //gdp: country.gdp,
          }));
          res.json(countriesData);
        } catch (error) {
          console.error('Error parsing country data:', error);
          res.status(500).send('Internal Server Error');
        }
      });
    });
    request.on('error', (error) => {
      console.error('Error fetching country data:', error);
      res.status(500).send('Internal Server Error');
    });
    request.end();
  } catch (error) {
    console.error('Error fetching country data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/area', (req, res) => {
  res.render('area');
});

app.get('/api/stock', async (req, res) => {
  try {
    const apiKey = 'SSVH45XI5PED1ZDB';
    const symbol = 'GOOGL';
    const apiUrl = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${apiKey}`;

    https.get(apiUrl, (response) => {
      let data = '';
      response.on('data', (chunk) => {
        data += chunk;
      });
      response.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          res.json(jsonData);
        } catch (error) {
          console.error('Error parsing stock data:', error);
          res.status(500).send('Internal Server Error');
        }
      });
    }).on('error', (error) => {
      console.error('Error fetching stock data:', error);
      res.status(500).send('Internal Server Error');
    });
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/stock', (req, res) => {
  res.render('stock');
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error(err);
    }
    res.redirect('/');
  });
});

async function createTransporter(){
  try {
    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS
      },
      tls: {
        rejectUnauthorized: true,
      },
    });
    await verifyTransport(transporter);
    return transporter;
  }catch (error){
    console.error('Transport failed:', error);
  }
}
async function verifyTransport(transporter) {
  try {
    await transporter.verify();
    //console.log('Transporter is ready');
  } catch (error) {
    console.error('Mail transporter verification failed:', error);
  }
}

async function sendMail(recipient, subject, message) {
  try {
    let transporter = await createTransporter();

    let info = await transporter.sendMail({
      from: '"Final Project" <' + process.env.USER + '>',
      to: recipient,
      subject: subject,
      text: message
    });
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    res.render('index',{user:req.user});
  } else {
    res.render('login',{message:false});
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});