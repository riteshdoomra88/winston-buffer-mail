# winston-buffer-mail
A winston mail library for buffer the error logs and send to email based on mailer for [winston][0].

## Installation

``` sh
  $ npm install winston
  $ npm install winston-buffer-mail
```

## Usage
``` js
  var winston = require('winston');
  
  //
  // Requiring `winston-buffer-mail` will expose 
  // `winston.transports.Mail`
  //
  require('winston-buffer-mail').Mail;
  
  winston.add(winston.transports.Mail, options);
```

The Mail transport uses [nodemailer](https://github.com/nodemailer/nodemailer.git) behind the scenes.  Options are the following:

* __to:__ The address(es) you want to send to. *[required]*
* __from:__ The 'from' address (default: `winston@[server-host-name].com`)
* __subject:__ Email subject
* __host:__ SMTP server hostname (default: localhost)
* __port:__ SMTP port (default: 587 or 25)
* __service:__ SMTP service (default: gmail)
* __username__ User for server auth *[required]*
* __password__ Password for server auth *[required]*
* __level:__ Level of messages that this transport should log. 
* __silent:__ Boolean flag indicating whether to suppress output.
* __prefix:__ String for using in as prefix in the subject.
* __maxBufferItems__ Max errors that will be buffered (default 100)
* __maxBufferTimeSpan__ Max miliseconds errors will be buffered (default 60000)

[0]: https://github.com/flatiron/winston

