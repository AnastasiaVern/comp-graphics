
import java.applet.*;
import java.awt.*;
import java.awt.image.*;

public class PixApplet extends Applet implements Runnable {
    public int W = 0, H, pix[];
    public Image im;
    public boolean damage = true;
    private MemoryImageSource mis;
    private Thread t;

    public void setPix(int frame) {
       if (W != bounds().width || H != bounds().height)
	  init();
    }

    public void init() {
        W = bounds().width;  
        H = bounds().height;
        pix = new int[W*H];
        mis = new MemoryImageSource(W, H, pix, 0, W);
        mis.setAnimated(true);
        im = createImage(mis);
    }
    public void start() {
       if (t == null) {
          t = new Thread(this);
          t.start();
       }
    }
    public void stop() {
       if (t != null) {
          t.stop();
          t = null;
       }
    }
    public void run() {
       for (int frame = 1 ; true ; frame++) {
          setPix(frame);
          if (damage) {
             mis.newPixels(0, 0, W, H, true);
             repaint();
             
          }
          try {
             Thread.sleep(10);
          }
          catch(InterruptedException ie) { ; }
       }
    }
    public void update(Graphics g) {
        g.drawImage(im, 0, 0, null);
    }

    public int xy2i(int x, int y) { return y * W + x; }

    public int pack(int rgb[]) { return pack(rgb[0],rgb[1],rgb[2]); }

    public int pack(int r, int g, int b) {
       return ((r&255)<<16) | ((g&255)<< 8) | ((b&255)) | 0xff000000;
    }

    public void unpack(int rgb[], int packed) {
       rgb[0] = (packed >> 16) & 255;
       rgb[1] = (packed >>  8) & 255;
       rgb[2] = (packed      ) & 255;
   }
}
