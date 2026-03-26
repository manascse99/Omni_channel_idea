import { useState, useRef, useEffect } from 'react';

export default function OtpInput({ length = 6, onComplete }) {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.value !== '') {
      if (index < length - 1 && inputRefs.current[index + 1]) {
        inputRefs.current[index + 1].focus();
      }
    }

    if (newOtp.join('').length === length) {
      onComplete(newOtp.join(''));
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0 && inputRefs.current[index - 1]) {
        inputRefs.current[index - 1].focus();
      }
    }
  };

  return (
    <div className="flex justify-between gap-2 sm:gap-3 w-full max-w-[320px] mx-auto">
      {otp.map((data, index) => {
        return (
          <input
            key={index}
            type="text"
            ref={(ref) => inputRefs.current[index] = ref}
            className="w-12 h-14 bg-white/5 border border-white/10 rounded-xl text-center text-xl font-bold text-white focus:border-teal focus:bg-white/10 outline-none transition-all placeholder-white/20 shadow-sm"
            value={data}
            maxLength="1"
            placeholder="•"
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          />
        );
      })}
    </div>
  );
}
