export class ExtensionMetod {
  static firstLetterUppercase(str: string): string {
    const valueString = str.toLowerCase();
    return valueString
      .split(' ')
      .map((value: string) => `${value.charAt(0).toUpperCase()}${value.slice(1).toLowerCase()}`)
      .join(' ');
    // Ex: John Lewis
    // valueString = john lewis
    //string[] = value[0] = JOHN  and value[1] = lewis
    // return JOHN lewis as per this method
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
}
