
      const socket = io();
      const send = document.querySelector('#send');
      const shareLocation = document.querySelector('#shareLocation');
      const input = document.querySelector('#input');
      let message = document.querySelector('#messages');
      const head = document.querySelector('#head');
      const userName = window.prompt("Enter You name","User");
      socket.on('message', (msg) => {
        console.log(msg);
        alert(msg);
      });

      input.addEventListener('input', (e) => {
        e.preventDefault();
        socket.emit('typing',userName);
      });
      send.addEventListener('click', (e) => {
        console.log('clickin');
        e.preventDefault();
        if (input.value) {
          const msg = {
            name: userName,
            text: input.value,
            time: new Date().getTime
          }
          socket.emit('chat', msg, () => {
            console.log('deliverd');
          });
        }
        input.focus();
        input.value = '';
      });

      socket.on('chat', (msg) => {
        console.log('in chat');
        head.textContent = '';
        const item = document.createElement('li');
        item.innerHTML = `<p><strong>${msg.name}</strong> ${msg.time}<p><p>${msg.text}</p>`
        message.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
      });

      socket.on('typing', (user) => {
        head.textContent = `${user} Typing`;
      });

      shareLocation.addEventListener('click', (e) => {
        if (!navigator.geolocation) {
          return alert('Your browser does not support this!!');
        }
        navigator.geolocation.getCurrentPosition((position) => {
          const Location = {
            lat: position.coords.latitude,
            long: position.coords.longitude
          }
          socket.emit('chat', (Location));
        });
      });


    