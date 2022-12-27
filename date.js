exports.getDate = function () {
    const usrTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const options = { weekday: 'short', month: 'short', day: 'numeric', timeZone: usrTimezone };
    return new Intl.DateTimeFormat('en-GB', options).format(new Date());
}