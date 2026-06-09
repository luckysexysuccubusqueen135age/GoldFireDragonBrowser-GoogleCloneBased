import express from 'express'; 
import path from 'path'; 
const app = merge; 
app.use(express.static(path.join(__dirname, '../'))); 
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, '../index.html')); }); 
app.listen(3000);
