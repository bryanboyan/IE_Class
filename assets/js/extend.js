
/**
 * 为一个string填充chr. 默认填充0
 *   {num:21,digit:4} => return 0021; {num:1221,digit:3} => return 1221;
 * @param {String|Number} str - 原始string
 * @param {Number} digit - 输出位数
 * @param {Number|String} (chr) - 填充字符
 * @returns {String}
 */
String.fillChar = function(str, digit, chr) {

    if (str==null || str==undefined) return str;

    str = str.toString();
    var digDiff = digit-str.length;
    if (digDiff <= 0) return str;

    chr = chr || '0';

    for (var i=0; i<digDiff; ++i) str = chr+str;

    return str;
};

/**
 * @String dateStr, input string to new a Date
 * @String fmt, format for the output
 * @return String f_d, formated_date_string
 */
Date.format = function (dateStr, fmt) {
  var d = new Date(dateStr);
  var f_d;
  f_d = fmt.replace(/[yY]+/,  d.getFullYear());
  f_d = f_d.replace(/[m]/,    String.fillChar(d.getMonth()+1,2));
  f_d = f_d.replace(/[d]/,    String.fillChar(d.getDate(),2));
  f_d = f_d.replace(/[hH]+/,  String.fillChar(d.getHours(),2));
  f_d = f_d.replace(/i/,      String.fillChar(d.getMinutes(),2));
  f_d = f_d.replace(/s/,      String.fillChar(d.getSeconds(),2));
  return f_d;
};