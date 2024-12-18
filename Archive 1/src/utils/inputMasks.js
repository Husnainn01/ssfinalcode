export const masks = {
  phone: {
    apply: (value, countryCode) => {
      // Remove all non-digits
      const numbers = value.replace(/\D/g, '');
      
      // Apply different formats based on country code
      switch(countryCode) {
        case '+44': // UK
          return numbers.replace(/(\d{4})(\d{6})/, '$1 $2');
        case '+1': // US/Canada
          return numbers.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
        default:
          // Generic international format
          return numbers.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
      }
    },
    validate: (value, countryCode) => {
      const stripped = value.replace(/\D/g, '');
      switch(countryCode) {
        case '+44': // UK
          return stripped.length === 10;
        case '+1': // US/Canada
          return stripped.length === 10;
        default:
          return stripped.length >= 10;
      }
    }
  },
  postCode: {
    apply: (value, countryCode) => {
      const cleaned = value.toUpperCase();
      switch(countryCode) {
        case 'GB': // UK
          return cleaned.replace(/^(.{4})(.*)$/, '$1 $2');
        case 'US': // US
          return cleaned.replace(/^(.{5})(.*)$/, '$1-$2');
        default:
          return cleaned;
      }
    },
    validate: (value, country) => {
      const format = countries.find(c => c.code === country)?.postCodeFormat;
      if (!format) return true;
      return new RegExp(format).test(value);
    }
  }
}; 