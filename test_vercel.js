const http = require('https');
http.get('https://medimap-frontend.onrender.com/?t='+Date.now(), (res) => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const match = data.match(/src="(\/assets\/index-[^"]+\.js)"/);
    if(match) {
      http.get('https://medimap-frontend.onrender.com' + match[1], (res2) => {
        let js = '';
        res2.on('data', d => js += d);
        res2.on('end', () => {
          console.log('Has Render?', js.includes('medimap-backend-ygqj.onrender.com'));
          console.log('Has Railway?', js.includes('railway.app'));
          console.log('TryCatch present?', js.includes('localStorage.setItem("medimap_search_history","[]")'));
        });
      });
    } else {
      console.log('No JS chunk found');
    }
  });
});
