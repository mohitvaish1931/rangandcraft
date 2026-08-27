import mongoose from 'mongoose';

const run = async () => {
  await mongoose.connect('mongodb://localhost:27017/rangandcraft');
  const db = mongoose.connection.useDb('rangandcraft');
  const products = await db.collection('products').find({}).toArray();
  const images = ['/images/kurta-category.png', '/images/suits-category.png', '/images/indowestern-category.png', '/images/saree-category.png', '/images/three-piece-tops-category.png'];
  for (let p of products) {
    const randomImg = images[Math.floor(Math.random() * images.length)];
    await db.collection('products').updateOne({_id: p._id}, {$set: {image: randomImg, images: [randomImg, randomImg]}});
  }
  console.log('Updated all products with new demo images');
  process.exit(0);
};

run();
