export class ExtensionMetod {
  static firstLetterUppercase(str: string): string {
    const valueString = str.toLowerCase();
    return valueString
      .split(' ')
      .map((value: string) => `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`)
      .join(' ');
  }

  static lowercase(str: string): string {
    return str.toLowerCase();
  }

  static generateRandomIntegers(integerLength: number): number {
    const characters = '0123456789';
    let result = ' ';
    const characterLength = characters.length;
    for (let i = 0; i < integerLength; i++) {
      result += characters.charAt(Math.floor(Math.random() * characterLength));
    }
    return parseInt(result, 10);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static parseJson(prop: string): any {
    try {
      JSON.parse(prop);
    } catch (error) {
      return prop;
    }
    return JSON.parse(prop);
  }

  static isDataURL(value: string): boolean {
    const dataUrlRegex = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\\/?%\s]*)\s*$/i;
    return dataUrlRegex.test(value);
  }
}
