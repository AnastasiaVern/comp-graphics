
public class zbuffer1 extends PixApplet
{
   double V[][] = {
      {-.01,0,0, -.2,-.2,1}, 
      {.1,0,0, .2,-.2,1},
      {0,.11,0,  -.2,.2,1},
      {.08,.09,0,  .2,.2,1},
   };

   double polygon[][][] = {
      { V[0], V[1], V[2] },
      { V[1], V[2], V[3] },
   };
   double L[][] = {
      {1,1,1}
   };

   final double FAR_Z = -100000;
   double zbuffer[], normal[] = new double[3];

   public void init() {
      super.init();
      zbuffer = new double[W*H];
      clearZbuffer();
      for (int n = 0 ; n < polygon.length ; n++)
	 for (int i = 0 ; i < polygon[n].length ; i++) {
	    for (int k = 0 ; k < 3 ; k++)
	       normal[k] = polygon[n][i][k+3];
	    normalize(normal);
	    for (int k = 0 ; k < 3 ; k++)
	       polygon[n][i][k+3] = normal[k];
	 }

      for (int i = 0 ; i < L.length ; i++)
         normalize(L[i]);
   }
   public void setPix(int frame) {
      clearZbuffer();
      for (int n = 0 ; n < polygon.length ; n++)
	 displayPolygon(polygon[n]);
   }

   void clearZbuffer() {
      for (int i = 0 ; i < zbuffer.length ; i++)
	 zbuffer[i] = FAR_Z;
      for (int i = 0 ; i < W*H ; i++)
	 pix[i] = pack(0,0,0);
   }
   double rgb[] = new double[3];

   void projectVertex(double pt[], double p[]) {
  
      double x = pt[0], y = pt[1], z = pt[2];
      x =  W * x + W/2;
      y = -W * y + H/2;
      p[0] = x;
      p[1] = y;
      p[2] = z;

      doShading(pt, rgb);
      p[3] = rgb[0];
      p[4] = rgb[1];
      p[5] = rgb[2];
   }

   void doShading(double pt[], double rgb[]) {
      rgb[0] = rgb[1] = rgb[2] = 0.2;
      for (int i = 0 ; i < L.length ; i++) {
         double d = pt[3]*L[i][0] + pt[4]*L[i][1] + pt[5]*L[i][2];
	 if (d > 0) {
            rgb[0] += .8 * d;
            rgb[1] += .8 * d;
            rgb[2] += .8 * d;
         }
      }
   }

   double p[][] = new double[30][7]; // TEMPORARY STORAGE FOR SHADED PROJECTED POLYGON

   void displayPolygon(double polygon[][]) {
      int npts = polygon.length, x;
      double t, pL[] = new double[6], pR[] = new double[6];

      int ymin = H;
      int ymax = 0;
      for (int i = 0 ; i < npts ; i++) {
	 projectVertex(polygon[i], p[i]);
         ymin = Math.min(ymin, (int)p[i][1]);
         ymax = Math.max(ymax, (int)p[i][1]);
      }

      for (int y = ymin ; y <= ymax ; y++) {

         pL[0] = W;
         pR[0] = 0;
         for (int i = 0 ; i < npts ; i++) {
	    int j = (i+1) % npts;
	    if (p[i][1] < y != p[j][1] < y) {
	       t = (y - p[i][1]) / (p[j][1] - p[i][1]);
	       x = (int)lerp(t, p[i][0], p[j][0]);
	       if (x < pL[0])
		  for (int k = 0 ; k < 6 ; k++)
		     pL[k] = lerp(t, p[i][k], p[j][k]);
	       if (x >= pR[0])
		  for (int k = 0 ; k < 6 ; k++)
		     pR[k] = lerp(t, p[i][k], p[j][k]);
	    }
	 }

         for (x = (int)pL[0] ; x < (int)pR[0] ; x++) {
	    int i = xy2i(x,y);

	   	    t = (x - pL[0]) / (pR[0] - pL[0]);
	    double z = lerp(t, pL[2], pR[2]);

	               if (z > zbuffer[i]) {
               zbuffer[i] = z;
               pix[i] = pack(f2i(lerp(t, pL[3], pR[3])),
                             f2i(lerp(t, pL[4], pR[4])),
                             f2i(lerp(t, pL[5], pR[5])));
            }
         }
      }
   }

   void normalize(double v[]) {
      double s = Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
      v[0] /= s;
      v[1] /= s;
      v[2] /= s;
   }

    double lerp(double t, double a, double b) {
      return a + t * (b - a);
   }

    int f2i(double t) {
      return Math.max(0, Math.min(255, (int)(255 * t)));
   }
}
