# Changelog

## 2018-06-20

* Fixed inverted display and logging of incoming offers in online sessions
* Adjusted colors so that they are readable against a white background
* Announcing max_rounds at the start of a session

## 2018-06-21

* Added logging of ID hash when connecting to a remote server
* Fixed crash on Windows when Bob is a local script

## 2018-06-22

* Fixed documentation: --min-objects and --max-objects are about the total number of objects rather than objects per type
* Set default --max-objects to 6 and documented that

## 2018-06-25

* When two scripts are specified on the command line, use them in that order

## 2018-06-25

* More consistent logging of disconnection reasons

## 2018-06-26

* Added proof-of-work anti-spam measure (older clients may be asked to upgrade)

## 2018-07-17

* Fixed wrong offer values written to log files.
* Fixed logging regression introduced by the previous fix.
