const minimist = require('minimist');
const fs = require('fs');

const readFile = ({ filename }) => {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, {encoding: 'utf8'}, (err, data) => {
      if (err) reject(err);

      resolve(data);
    });
  });
};

(function () {
  let args = minimist(process.argv.slice(2));

  readFile({ filename: args._[0] }).then((content) => {
    let ipInfos = [];
    let ipFlags = [];
    let lastMaxCount = 0;
    let lastMaxIp = '';

    let ips = content.split('\n');
    for(let i = 0; i < ips.length; i++) {
      let ip = ips[i];

      let info = {
        ip,
        count: 1,
      };

      for(let j = i + 1; j < ips.length; j++) {
        if (ips[j] === ip) {
          info.count++;

          if (info.count > lastMaxCount) {
            lastMaxCount = info.count;
            lastMaxIp = ip;
          }
        }
      }

      if (ipFlags.indexOf(ip) === -1) {
        ipFlags.push(ip);
        ipInfos.push(info);
      }
    }

    // console.log(ipInfos);
    console.log(lastMaxIp);
  }).catch((err) => {
    console.error(err);
  });
}());
