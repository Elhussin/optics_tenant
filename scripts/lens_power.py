LENS_POWERS = [(f"{x:+.2f}", f"{x:+.2f}") for x in [i / 4 for i in range(-120, 121)]]

spherical_lens_powers = [f"{x:+.2f}" for x in [i / 4 for i in range(-120, 121)]]
cylinder_lens_powers = [f"-{abs(x):05.2f}" for x in [i / 4 for i in range(-60, 1)]]
additional_lens_powers = [f"-{abs(x):05.2f}" for x in [i / 4 for i in range(-60, 1)]]
# print(LENS_POWERS)
# print(spherical_lens_powers)
print(cylinder_lens_powers)
