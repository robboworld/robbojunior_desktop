# robbojunior_desktop

RobboJunior is a fork of ScratchJr (https://github.com/LLK/scratchjr) project. This repository is a desktop version of RobboJunior application.
We use Electron framework (http://electronjs.org/) as a runtime environment. 


## Building RobboJunior

On Ubuntu (or Linux Mint) 

To build RobboJunior you need to download or clone this repository and then run build.sh script. You can use -s (--start_junior ) option to immediately start RobboJunior after the building process has finished and -c (--copy_files ) option to copy all needed files into the "distribution folders". 

To sucessfully finish the building process you should have node and npm [installed]. Our script automatically tries to install node and npm, but you can do it manually by follow these (https://nodejs.org/en/download/package-manager/) instructions. 

On first start our script also tries to execute the RobboJunior npm package installation process  by running <tt>npm install</tt> command.
