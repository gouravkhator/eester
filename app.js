const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const app = express();

//Text Compression
app.use(require('compression')());
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(expressLayouts);

app.set('layout', 'layouts/layout');
app.use(express.static('public'));
app.use(express.json());

app.get('/*', (req, res) => {
    res.render('404');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on ${PORT}`));
