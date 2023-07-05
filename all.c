int main(void) {
  return 0;
}

struct A {
  double x;
  long y;
  int : 1, z : 2;
};
union B {
  struct A x;
  int : 3, y : 4;
  unsigned short z;
};
enum C { D, E = 1 };
void a(void (*r)(int x, double y, char z)) {
  char b = '0';
  signed char c = 1;
  unsigned char d = 2;
  short e = 3;
  signed short f = 4;
  unsigned short g = 5u;
  signed int h = 6;
  unsigned int i = 7;
  long j = 8;
  signed long k = 9l;
  unsigned long l = 10ul;
  float m = 3.14f;
  double n = 3.14;
  long double o = 3.14L;
  const char *p = "hello";
  void (*q)(int, double, char) = r;
  q(h, n, b);
}
void b(int i[][5], int (*j)(int), int (*k[])(int)) {
  auto int c = 0;
  const int d = 1;
  extern int e;
  register int f = 3;
  static int g = 4;
  volatile int h = 5;
  k[1] = j;
  i[0][1] = sizeof j;
  i[2][3] = sizeof(void (*)(int, int (*)(int), int([])[5]));
  j(i[1][2]);
  k[0](i[3][4]);
}
void c(void) {
  struct A d = {1.23, 4, 1};
  union B e, *f = &e;
  int g[100] = {0};
  f->x = d;
  e.z++;
  g[g[0]] = (*f).x.y--;
  g[1] = ((g[0] < g[1]) && (g[2] > g[3]) == (g[4] <= g[5]) ||
          !(g[6] >= g[7])) != g[8]
             ? ((int)e.y * +g[3] / -g[4] % ++g[4] + --g[3] - g[3])
             : ((g[2] << g[2]) | (g[3] >> g[3]) & (~g[3] ^ g[4]));
  g[3] += g[3], g[4] -= g[3];
  g[3] *= g[3] /= g[3] %= g[2];
  g[3] <<= g[3] >>= g[3];
  g[3] &= g[3] ^= g[3] |= g[3];
}
int d(int x) {
  while (x < 10) {
    switch (x) {
    case D:
      x = 1;
      break;
    case E: {
      if (x == 2)
        x = 3;
      else if (x == 4)
        for (x = 0; x < 10; x++) {
          x = 5;
        }
      else {
        x = 6;
        goto P;
      }
    } break;
    default:
      do {
        x--;
      } while (x > 0);
      break;
    }
    if (x == 7) continue;
  }
P:
  return x;
}
