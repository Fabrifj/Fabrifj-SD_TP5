// Definir los puntos que conforman la figura de palitos
#declare torso_top    = <0, 0.5, 0>;
#declare torso_bottom = <0, 0, 0>;
#declare left_arm_top = <-0.5, 0.5, 0>;
#declare left_arm_bot = <0, 0, 0>;
#declare right_arm_top = <0.5, 0.5, 0>;
#declare right_arm_bot = <0, 0, 0>;
#declare left_leg_top = <-0.25, -1, 0>;
#declare left_leg_bot = <0, 0, 0>;
#declare right_leg_top = <0.25, -1, 0>;
#declare right_leg_bot = <0, 0, 0>;

// Dibujar la figura de palitos con fondo blanco
camera {
  location <0, 2, -4>
  look_at <0, 0, 0>
}
light_source {
  <0, 5, -5>
  color rgb <1, 1, 1>
}
background {color rgb <1, 1, 1>} // Fondo blanco
union {
  cylinder {torso_top, torso_bottom, 0.05}
  cylinder {left_arm_top, left_arm_bot, 0.05}
  cylinder {right_arm_top, right_arm_bot, 0.05}
  cylinder {left_leg_top, left_leg_bot, 0.05}
  cylinder {right_leg_top, right_leg_bot, 0.05}
}
sphere {
 <0, 0.5, 0> 0.25
 pigment {color rgb <1, 0 , 0>}
}
