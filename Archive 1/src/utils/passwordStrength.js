export const checkPasswordStrength = (password) => {
  let strength = 0;
  let feedback = [];

  // Length check
  if (password.length >= 12) {
    strength += 25;
  } else if (password.length >= 8) {
    strength += 15;
  } else {
    feedback.push("Password should be at least 8 characters long");
  }

  // Uppercase letters
  if (password.match(/[A-Z]/g)) {
    strength += 25;
  } else {
    feedback.push("Add uppercase letters");
  }

  // Lowercase letters
  if (password.match(/[a-z]/g)) {
    strength += 15;
  } else {
    feedback.push("Add lowercase letters");
  }

  // Numbers
  if (password.match(/[0-9]/g)) {
    strength += 25;
  } else {
    feedback.push("Add numbers");
  }

  // Special characters
  if (password.match(/[^A-Za-z0-9]/g)) {
    strength += 25;
  } else {
    feedback.push("Add special characters");
  }

  // Bonus for mixture
  if (password.match(/[A-Z]/) && password.match(/[a-z]/) && 
      password.match(/[0-9]/) && password.match(/[^A-Za-z0-9]/)) {
    strength += 10;
  }

  return {
    strength: Math.min(100, strength),
    feedback
  };
};