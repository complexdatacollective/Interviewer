#!/usr/bin/env node

const fs = require('fs');
const svg2png = require('svg2png');
const path = require('path');
const icongen = require('icon-gen');

const jobs = [
  {
    type: 'cordova',
    inputFile: 'assets/icons/NC-Flat.svg',
    outputPath: './public/icons/android/',
    sizes: [36, 48, 72, 96, 144, 192],
    fileName: 'NC-Round-',
    append: ['ldpi', 'mdpi', 'hdpi', 'xhdpi', 'xxhdpi', 'xxxhdpi'],
  },
  {
    type: 'cordova',
    inputFile: './assets/icons/NC-iOS.svg',
    outputPath: './public/icons/ios/',
    sizes: [76, 152, 40, 80, 72, 144, 50, 100, 167, 1024],
    fileName: 'NC-Square-',
    append: 'size',

  },
  {
    type: 'electron',
    inputFile: 'assets/icons/NC-Desktop.svg',
    outputPath: 'build-resources',
    options: {
      modes: ['ico', 'icns'],
      names: {
        ico: 'icon',
        icns: 'icon',
      },
      report: true,
    },
  },
];

function generateElectronIcons(job) {
  icongen(job.inputFile, job.outputPath, job.options).then((results) => {
    console.log(results);
  }).catch((err) => {
    console.log(err);
  });
}

const createDir = (dir) => {
  // This will create a dir given a path such as './folder/subfolder'
  const splitPath = dir.split('/');
  splitPath.reduce((dirPath, subPath) => {
    let currentPath;
    if (subPath !== '.') {
      currentPath = `${dirPath}/${subPath}`;
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath);
      }
    } else {
      currentPath = subPath;
    }
    return currentPath;
  }, '');
};

function generateCordovaIcons(job) {
  const buffer = fs.readFileSync(job.inputFile);
  job.sizes.forEach((size) => {
    if (!buffer) {
      throw new Error(`Faild to write the image, ${job.size}`);
    }

    let dest = job.fileName;

    if (job.append === 'size') {
      dest += size;
    } else if (job.append.length) {
      dest += job.append[job.sizes.indexOf(size)];
    }

    dest = `${dest}.png`;

    dest = path.join(job.outputPath + dest);

    svg2png(buffer, { width: size, height: size }).then((output) => {
      createDir(job.outputPath);
      fs.writeFile(dest, output, (err) => {
        if (err) {
          console.log(err);
        }
      });
    });
  });
}

function parseJobs(jobList) {
  jobList.forEach((job) => {
    if (job.type === 'electron') {
      generateElectronIcons(job);
    } else if (job.type === 'cordova') {
      generateCordovaIcons(job);
    }
  });
}


parseJobs(jobs);

// TODO: remove once underlying issue fixed: https://github.com/akabekobeko/npm-icon-gen/issues/86
const warn = (msg) => { console.warn(require('chalk').yellow(msg)); }; // eslint-disable-line
warn('Warning: *.ico output for Windows may be corrupted.');
warn('You should re-export from another editor.');
warn('Issue: https://github.com/complexdatacollective/Network-Canvas/issues/602');
