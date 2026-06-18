import Capacitor
import UIKit

/// When the interview UI runs full screen (older iPadOS, or under Guided Access /
/// Single App Mode), hide the status bar and defer the screen-edge system gestures
/// so a swipe near an edge doesn't pull in system UI mid-interview. (The home
/// indicator is managed by CAPBridgeViewController and can't be re-overridden here.)
class MainViewController: CAPBridgeViewController {
  override var prefersStatusBarHidden: Bool {
    return true
  }

  override var preferredScreenEdgesDeferringSystemGestures: UIRectEdge {
    return .all
  }
}
