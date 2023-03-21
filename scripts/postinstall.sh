#!/bin/sh

node_modules/.bin/rn-nodeify --install crypto,buffer,react-native-randombytes,vm,stream,http,https,url,process,path --hack
rsync -av -R ./node_modules/@wallet3/account-abstraction-contracts node_modules/@account-abstraction/sdk
