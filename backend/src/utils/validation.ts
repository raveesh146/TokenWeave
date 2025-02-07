interface MemeCoinInput {
  company_name: string;
  product_name: string;
  twitter_handle: string;
  product_info: string;
}

export function validateInput(data: any): string | null {
  const requiredFields: (keyof MemeCoinInput)[] = [
    'company_name',
    'product_name',
    'twitter_handle',
    'product_info'
  ];

  // missing fields
  for (const field of requiredFields) {
    if (!data[field]) {
      return `Missing required field: ${field}`;
    }
  }

  // Validate Twitter handle format
  const twitterHandle = data.twitter_handle.replace('@', '');
  if (!/^[A-Za-z0-9_]{1,15}$/.test(twitterHandle)) {
    return 'Invalid Twitter handle format';
  }

  // Validate string lengths
  if (data.company_name.length > 100) {
    return 'Company name too long (max 100 characters)';
  }

  if (data.product_name.length > 100) {
    return 'Product name too long (max 100 characters)';
  }

  if (data.product_info.length > 500) {
    return 'Product info too long (max 500 characters)';
  }

  return null;
} 