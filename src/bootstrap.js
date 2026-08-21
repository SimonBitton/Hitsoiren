(function bootstrapDocument() {
  var ua = navigator.userAgent || '';
  var platform = navigator.platform || '';
  var maxTouch = navigator.maxTouchPoints || 0;
  var os = 'unknown';

  if (/android/i.test(ua)) os = 'android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'ios';
  else if (platform === 'MacIntel' && maxTouch > 1) os = 'ios';
  else if (/mac/i.test(platform) || /macintosh/i.test(ua)) os = 'mac';
  else if (/win/i.test(platform) || /windows/i.test(ua)) os = 'windows';
  else if (/linux/i.test(platform) || /linux/i.test(ua)) os = 'linux';

  document.documentElement.dataset.os = os;
  if ('ontouchstart' in window || maxTouch > 0) {
    document.documentElement.dataset.touch = 'true';
  }

  try {
    var savedTheme = localStorage.getItem('histoiren:theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.dataset.theme = savedTheme === 'dark' || savedTheme === 'light'
      ? savedTheme
      : (prefersDark ? 'dark' : 'light');
  } catch {
    document.documentElement.dataset.theme = 'light';
  }
}());
