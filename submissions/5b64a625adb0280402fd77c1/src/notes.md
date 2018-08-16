# Notes

Possible directions of further research.

## Minimum deal value

Don't reward deals that bring less that half of the total reward. This seems to
be promising, as it correctly trains on estimator to have lower acceptance rate
than on other policy agents (around 60%). However, it looks like the acceptance
rates are generally lower than in continuous reward. Perhaps, higher no
consensus penalty would help? It might be a good idea to try changing the
minimum deal value with time.

## Various no consensus penalties

0.6, 0.7, 0.8, 1.0 were tried, and the acceptance rate goes up linearly with
increased penalty. However, it isn't clear if the performance is actually
better.
