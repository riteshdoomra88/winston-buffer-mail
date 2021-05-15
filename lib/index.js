/**
 * winston-buffer-mail.js: Winston transport based on nodemailer.
 *
 */

 var util = require("util");
 var os = require("os");
 var nodemailer = require("nodemailer");
 var winston = require("winston");
 var transporter;
 /**
  * @constructs Mail
  * @param {object} options hash of options
  */
 
 var Mail = (exports.Mail = function (options) {
   options = options || {};
 
   if (!options.to || !options.username || !options.password) {
     throw "winston-buffer-mail requires predefined property";
   }
 
   transporter = nodemailer.createTransport({
     service: options.service || 'gmail',
     auth: {
       user: options.username,
       pass: options.password,
     },
   });
 
   /** winston */
   this.name = "mail";
   this.level = options.level || "info";
   this.silent = options.silent || false;
 
   /** buffering */
   this.maxBufferItems = options.maxBufferItems || 100;
   this.maxBufferTimeSpan = options.maxBufferTimeSpan || 60 * 1000;
   this.buffer = [];
   this.flushId = setTimeout(this.flush.bind(this), this.maxBufferTimeSpan);
   this.subject = options.subject || "Winston Error";
   /** mail options */
   this.opts = {
     port: options.port,
     host: options.host,
     authentication: options.authentication || "login",
     to: options.to,
     from: options.from || "winston@" + os.hostname() + ".com",
     prefix: options.prefix || "Winston: ",
   };
 });
 
 /** @extends winston.Transport */
 util.inherits(Mail, winston.Transport);
 
 /**
  * Define a getter so that `winston.transports.MongoDB`
  * is available and thus backwards compatible.
  */
 
 winston.transports.Mail = Mail;
 
 /**
  * Core logging method exposed to Winston. Metadata is optional.
  * @function log
  * @member Mail
  * @param level {string} Level at which to log the message
  * @param msg {string} Message to log
  * @param meta {Object} **Optional** Additional metadata to attach
  * @param callback {function} Continuation to respond to when complete.
  * @api public
  */
 
 Mail.prototype.log = function (level, msg, meta, callback) {
   if (this.silent) return callback(null, true);
   if (meta) meta = util.inspect(meta, null, 5);
 
   var obj;
   try {
     obj = JSON.parse(msg);
   } catch (e) {}
 
   var message = {
     subject: "Winston: " + level + " - " + ((obj && obj.message) || msg),
     text: msg + "\n\r\n\r" + meta,
   };
 
   this.push(message);
 
   this.emit("logged");
   callback(null, true);
 };
 
 /**
  * Buffer the messsages so we don't flood mail inboxes.
  * @api private
  */
 
 Mail.prototype.push = function (email) {
   this.buffer.push(email);
 
   if (this.buffer.length >= this.bufferMaxItems) {
     this.flush();
   }
 };
 
 /**
  * Flush the buffer and pack all the errors in one email.
  * @api private
  */
 
 Mail.prototype.flush = function () {
   var self = this;
 
   if (this.buffer.length > 0) {
     //temp the buffer, and reset it for the next
     //batch
     var buf = this.buffer;
     this.buffer = [];
 
     //compose the subject and body
     var subject, body;
     if (buf.length === 1) {
       /**
        * If there's only one error, send the details
        * on the subject.
        */
       subject = this.subject; //buf[0].subject;
       body = buf[0].text;
     } else {
       subject = buf.length + " " + this.subject;
       body = "";
       buf.forEach(function (message) {
         body = body + "<br>";
         body = body + "<h3>" + message.subject + "</h3><br>";
         body = body + "<pre>" + message.text + "</pre><br><hr>";
       });
     }
 
     /**
      * Contruct the message object for mailer.
      * The use of prefix helps identify where the error originated.
      */
 
     var message = {
       subject: this.opts.prefix + subject,
       html: body,
     };
 
     Object.keys(this.opts).forEach(function (key) {
       message[key] = self.opts[key];
     });
 
     transporter.sendMail(message, function (err) {
       if (err) {
         console.error("error while sending winston error log email.");
         console.dir(err);
       }
     });
   }
 
   clearTimeout(this.flushId);
   this.flushId = setTimeout(this.flush.bind(this), this.maxBufferTimeSpan);
 };
 