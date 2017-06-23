function* uidGenerator() {
  let i = 1;
  for (;;) {
    yield i;
    i += 1;
  }
}

export default uidGenerator;
