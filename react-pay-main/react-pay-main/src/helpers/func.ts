const convertStringToPrice = (value: number) => {
  const formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });

  return formatter.format(value);
};

const calculateDiscountPercentage = (
  originalPrice: number | string,
  price: number | string
): number => {
  const original =
    typeof originalPrice === 'string' ? Number(originalPrice) : originalPrice;
  const current = typeof price === 'string' ? Number(price) : price;

  if (isNaN(original) || isNaN(current) || original <= 0) {
    return 0;
  }

  if (current >= original) {
    return 0;
  }

  const discount = ((original - current) / original) * 100;
  return Math.round(discount);
};

// ? Chuyển đổi định dạng ngày thành DD-MM-YYYY HH:mm:ss
const formattedDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  // const seconds = date.getSeconds();

  return `${day}-${month}-${year} ${hours}:${minutes}`;
};

const convertNameSku = (str: string) => {
  if (!str) return '';

  return str
    .split(' ')
    .map((word: string | number) => {
      // Nếu từ đó là "Iphone" (không phân biệt hoa thường), quy đổi thẳng thành "IP"
      if (String(word).toLowerCase() === 'iphone') {
        return 'IP';
      }
      if (String(word).toLowerCase() === 'imac') {
        return 'IM';
      }
      if (String(word).toLowerCase() === 'ipad') {
        return 'IPA';
      }
      if (String(word).toLowerCase() === 'earpods') {
        return 'EP';
      }
      // Nếu là số thì giữ nguyên
      if (!isNaN(Number(word))) {
        return word;
      }
      // Các từ còn lại (Pro, Max, Plus...) thì lấy chữ cái đầu và viết hoa
      return String(word).charAt(0).toUpperCase();
    })
    .join('');
};

const removeVietnameseTones = (str: string) => {
  return str
    .normalize('NFD') // Tách các dấu ra khỏi chữ cái gốc (Ví dụ: Ồ -> O + ◌̂ + ◌̀)
    .replace(/[\u0300-\u036f]/g, '') // Xóa các ký tự dấu vừa được tách ra
    .replace(/đ/g, 'd') // Chuyển đổi chữ đ thường thành d
    .replace(/Đ/g, 'D'); // Chuyển đổi chữ Đ hoa thành D
};

export {
  convertStringToPrice,
  calculateDiscountPercentage,
  formattedDate,
  convertNameSku,
  removeVietnameseTones,
};
